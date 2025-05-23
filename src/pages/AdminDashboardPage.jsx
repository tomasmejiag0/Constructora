
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Users, Briefcase, BarChart3, Settings, Building } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';

    export default function AdminDashboardPage() {
      const stats = [
        { title: "Total Users", value: "150", icon: <Users className="h-6 w-6 text-primary" />, color: "text-primary", link: "/admin/users" },
        { title: "Active Projects", value: "25", icon: <Briefcase className="h-6 w-6 text-tertiary" />, color: "text-tertiary", link: "/admin/projects" },
        { title: "Tasks Completed", value: "1200", icon: <BarChart3 className="h-6 w-6 text-accent" />, color: "text-accent", link: "#" },
      ];

      const managementLinks = [
        { title: "Manage Users", path: "/admin/users", icon: <Users className="mr-2 h-5 w-5" /> },
        { title: "Manage Projects", path: "/admin/projects", icon: <Building className="mr-2 h-5 w-5" /> },
        { title: "System Settings", path: "#", icon: <Settings className="mr-2 h-5 w-5" /> },
      ];

      return (
        <div className="container mx-auto py-8 px-4 md:px-6">
          <motion.h1 
            className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-tertiary"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Admin Dashboard
          </motion.h1>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="glassmorphism-card hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    {stat.icon}
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <p className="text-xs text-muted-foreground pt-1">
                      <Link to={stat.link} className="hover:underline">View Details</Link>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-xl">Management Sections</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {managementLinks.map((item) => (
                  <Button key={item.title} asChild variant="outline" className="justify-start text-left h-auto py-3 bg-secondary/50 hover:bg-secondary/80">
                    <Link to={item.path}>
                      {item.icon}
                      <span className="font-semibold">{item.title}</span>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Activity log will be displayed here...</p>
                <ul className="mt-4 space-y-2">
                  <li className="text-sm p-2 bg-secondary/30 rounded-md">New user 'John Doe' registered.</li>
                  <li className="text-sm p-2 bg-secondary/30 rounded-md">Project 'Skyscraper X' status updated to 'In Progress'.</li>
                  <li className="text-sm p-2 bg-secondary/30 rounded-md">Task 'Foundation Pouring' completed.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }
  