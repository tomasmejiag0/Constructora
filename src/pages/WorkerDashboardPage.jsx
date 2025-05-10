
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { ClipboardList, CalendarClock, UserCheck, MapPin } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';

    export default function WorkerDashboardPage() {
      const workerInfo = [
        { title: "Assigned Site", value: "Sky Tower Project", icon: <MapPin className="h-6 w-6 text-primary" />, color: "text-primary", actionText: "View Site Details", link: "/worker/site" },
        { title: "Today's Tasks", value: "3 Pending", icon: <ClipboardList className="h-6 w-6 text-tertiary" />, color: "text-tertiary", actionText: "View My Tasks", link: "#" },
        { title: "Attendance", value: "Not Checked In", icon: <UserCheck className="h-6 w-6 text-accent" />, color: "text-accent", actionText: "Mark Attendance", link: "/worker/attendance" },
      ];

      return (
        <div className="container mx-auto py-8 px-4 md:px-6">
          <motion.h1 
            className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-tertiary"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Worker Dashboard
          </motion.h1>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workerInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="glassmorphism-card hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{info.title}</CardTitle>
                    {info.icon}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className={`text-2xl font-bold ${info.color}`}>{info.value}</div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Your current status
                    </p>
                  </CardContent>
                  {info.actionText && (
                    <div className="p-4 pt-0">
                      <Button asChild className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground">
                        <Link to={info.link}>{info.actionText}</Link>
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-xl">My Tasks Overview</CardTitle>
                <CardDescription>Quick look at your current assignments.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
                    <span>Install Fixtures - Building A, Floor 2</span>
                    <span className="text-xs px-2 py-1 bg-yellow-500 text-white rounded-full">Pending</span>
                  </li>
                  <li className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
                    <span>Safety Check - Site B</span>
                    <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">Completed</span>
                  </li>
                  <li className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
                    <span>Material Transport - Warehouse to Site A</span>
                    <span className="text-xs px-2 py-1 bg-yellow-500 text-white rounded-full">In Progress</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }
  