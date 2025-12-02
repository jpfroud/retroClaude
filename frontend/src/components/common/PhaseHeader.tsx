import { ReactNode } from 'react';

interface PhaseHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: string;
}

function PhaseHeader({ icon, title, description, color = 'primary' }: PhaseHeaderProps) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="text-center mb-8">
      <div className={`w-16 h-16 ${colorClasses[color as keyof typeof colorClasses]} rounded-full flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
    </div>
  );
}

export default PhaseHeader;
