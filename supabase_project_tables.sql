-- Attendance table
CREATE TABLE public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE,
    total_hours DECIMAL(5,2),
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'early_leave')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Attendance policies
CREATE POLICY "Users can view their own attendance"
    ON public.attendance FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attendance"
    ON public.attendance FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage attendance"
    ON public.attendance FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Tasks table
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- User Tasks (assignments) table
CREATE TABLE public.user_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'declined')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(task_id, user_id)
);

-- Enable RLS for user_tasks
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Budget table
CREATE TABLE public.budget (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for budget
ALTER TABLE public.budget ENABLE ROW LEVEL SECURITY;

-- Inventory table
CREATE TABLE public.inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2),
    category TEXT,
    minimum_quantity INTEGER DEFAULT 0,
    location TEXT,
    last_restock_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for inventory
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Inventory Transactions table
CREATE TABLE public.inventory_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID REFERENCES public.inventory(id),
    quantity INTEGER NOT NULL,
    type TEXT CHECK (type IN ('in', 'out')) NOT NULL,
    reason TEXT,
    user_id UUID REFERENCES public.profiles(id),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for inventory_transactions
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view all tasks"
    ON public.tasks FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage tasks"
    ON public.tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for user_tasks
CREATE POLICY "Users can view their assigned tasks"
    ON public.user_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their assigned tasks"
    ON public.user_tasks FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for budget
CREATE POLICY "Admins can manage budget"
    ON public.budget FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for inventory
CREATE POLICY "Users can view inventory"
    ON public.inventory FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage inventory"
    ON public.inventory FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for inventory transactions
CREATE POLICY "Users can view inventory transactions"
    ON public.inventory_transactions FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage inventory transactions"
    ON public.inventory_transactions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX attendance_user_id_idx ON public.attendance(user_id);
CREATE INDEX attendance_check_in_idx ON public.attendance(check_in);
CREATE INDEX tasks_created_by_idx ON public.tasks(created_by);
CREATE INDEX tasks_due_date_idx ON public.tasks(due_date);
CREATE INDEX user_tasks_user_id_idx ON public.user_tasks(user_id);
CREATE INDEX user_tasks_task_id_idx ON public.user_tasks(task_id);
CREATE INDEX budget_category_idx ON public.budget(category);
CREATE INDEX budget_date_idx ON public.budget(date);
CREATE INDEX inventory_item_name_idx ON public.inventory(item_name);
CREATE INDEX inventory_category_idx ON public.inventory(category);
CREATE INDEX inventory_transactions_inventory_id_idx ON public.inventory_transactions(inventory_id);

-- Function to calculate total hours when checking out
CREATE OR REPLACE FUNCTION calculate_total_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.check_out IS NOT NULL THEN
        NEW.total_hours = EXTRACT(EPOCH FROM (NEW.check_out - NEW.check_in)) / 3600;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for calculating total hours
CREATE TRIGGER update_total_hours
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW
    WHEN (NEW.check_out IS NOT NULL AND OLD.check_out IS NULL)
    EXECUTE FUNCTION calculate_total_hours();

-- Function to update inventory quantity
CREATE OR REPLACE FUNCTION update_inventory_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'in' THEN
        UPDATE inventory SET 
            quantity = quantity + NEW.quantity,
            last_restock_date = CASE 
                WHEN NEW.quantity > 0 THEN NEW.transaction_date 
                ELSE last_restock_date 
            END
        WHERE id = NEW.inventory_id;
    ELSIF NEW.type = 'out' THEN
        UPDATE inventory SET quantity = quantity - NEW.quantity
        WHERE id = NEW.inventory_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating inventory quantity
CREATE TRIGGER update_inventory_quantity_trigger
    AFTER INSERT ON public.inventory_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_quantity();
