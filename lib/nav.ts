import type { NavItem } from "@/components/layout/DashboardShell";

export const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: "home" },
  { href: "/dashboard/admin/teachers", label: "Teachers", icon: "users" },
  { href: "/dashboard/admin/students", label: "Students", icon: "graduation" },
  { href: "/dashboard/admin/batches", label: "Batches", icon: "layers" },
  { href: "/dashboard/admin/routine", label: "Routine", icon: "calendar" },
  { href: "/dashboard/admin/attendance", label: "Attendance", icon: "calendarCheck" },
  { href: "/dashboard/admin/exams", label: "Exams & Results", icon: "clipboard" },
  { href: "/dashboard/admin/fees", label: "Fees", icon: "card" },
  { href: "/dashboard/admin/notices", label: "Notices", icon: "bell" },
  { href: "/dashboard/admin/materials", label: "Materials", icon: "book" },
  { href: "/dashboard/admin/settings", label: "Settings", icon: "sliders" },
  { href: "/dashboard/admin/account", label: "My account", icon: "user" },
];
export const teacherNav: NavItem[] = [
  { href: "/dashboard/teacher", label: "Overview", icon: "home" },
  { href: "/dashboard/teacher/students", label: "Students & Approvals", icon: "graduation" },
  { href: "/dashboard/teacher/batches", label: "Batches", icon: "layers" },
  { href: "/dashboard/teacher/routine", label: "Routine", icon: "calendar" },
  { href: "/dashboard/teacher/attendance", label: "Attendance", icon: "calendarCheck" },
  { href: "/dashboard/teacher/exams", label: "Exams & Results", icon: "clipboard" },
  { href: "/dashboard/teacher/fees", label: "Fees", icon: "card" },
  { href: "/dashboard/teacher/notices", label: "Notices", icon: "bell" },
  { href: "/dashboard/teacher/materials", label: "Materials", icon: "book" },
  { href: "/dashboard/teacher/account", label: "My account", icon: "user" },
];
export const studentNav: NavItem[] = [
  { href: "/dashboard/student", label: "Dashboard", icon: "home" },
  { href: "/dashboard/student/account", label: "My Profile", icon: "user" },
  { href: "/dashboard/student/attendance", label: "Attendance", icon: "calendarCheck" },
  { href: "/dashboard/student/routine", label: "Routine", icon: "calendar" },
  { href: "/dashboard/student/results", label: "Results", icon: "chart" },
  { href: "/dashboard/student/fees", label: "Fees", icon: "card" },
  { href: "/dashboard/student/notices", label: "Notices", icon: "bell" },
  { href: "/dashboard/student/materials", label: "Study Materials", icon: "book" },
];
export const parentNav: NavItem[] = [
  { href: "/dashboard/parent", label: "My Children", icon: "users" },
  { href: "/dashboard/parent/attendance", label: "Attendance", icon: "calendarCheck" },
  { href: "/dashboard/parent/routine", label: "Routine & Notice", icon: "calendar" },
  { href: "/dashboard/parent/fees", label: "Monthly Fee", icon: "card" },
  { href: "/dashboard/parent/results", label: "Exam Results", icon: "chart" },
  { href: "/dashboard/parent/account", label: "My account", icon: "user" },
];
