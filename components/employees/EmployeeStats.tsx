'use client'

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/lib/mock-data';

interface EmployeeStatsProps {
  employees: Employee[];
}

const EmployeeStats = memo(function EmployeeStats({ employees }: EmployeeStatsProps) {
  const stats = [
    { 
      label: 'Total Funcionários', 
      value: employees.length, 
      color: 'blue' 
    },
    { 
      label: 'Ativos', 
      value: employees.filter(e => e.status === 'active').length, 
      color: 'green' 
    },
    { 
      label: 'Em Licença', 
      value: employees.filter(e => e.status === 'on_leave').length, 
      color: 'yellow' 
    },
    { 
      label: 'Contratações Recentes', 
      value: employees.filter(e => {
        if (!e.admissionDate) return false;
        const admissionDate = new Date(e.admissionDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return admissionDate >= thirtyDaysAgo;
      }).length, 
      color: 'purple' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <Users className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
});

export default EmployeeStats; 
