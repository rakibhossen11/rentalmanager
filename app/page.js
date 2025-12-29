// app/page.js (or rename your current HomePage to this)
import DashboardClient from './components/DashboardClient';
import { getDashboardData } from './components/server/dashboard';

export default async function HomePage() {
  const dashboardData = await getDashboardData();
  
  return <DashboardClient initialData={dashboardData} />;
}