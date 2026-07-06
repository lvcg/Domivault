"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, CalendarPlus, Mail, MessageSquareText, Pencil, Plus, Trash2, UsersRound, X } from "lucide-react";
import { maintenanceTasks, vendors } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import type { MaintenancePriority, MaintenanceStatus, MaintenanceTask, ReminderChannel } from "@/types/homey";
import { formatTimestamp } from "@/lib/utils";
import { PremiumLock } from "@/components/ui/premium-lock";
import { createGoogleCalendarMaintenanceUrl } from "@/lib/calendar";
import { createClient } from "@/lib/supabase/client";

const priorityTone = {
  critical: "rose",
  recommended: "indigo",
  seasonal: "amber",
} as const;

const statusTone = {
  pending: "slate",
  overdue: "rose",
  completed: "emerald",
} as const;

const emptyTask = {
  title: "",
  area: "",
  cadence: "Every 3 months",
  dueDate: new Date().toISOString().slice(0, 10),
  reminderDate: "",
  reminderChannel: "email" as ReminderChannel,
  assignedVendorId: "",
  notes: "",
  priority: "recommended" as MaintenancePriority,
  status: "pending" as MaintenanceStatus,
};

type MaintenanceTaskRow = {
  id: string;
  title: string;
  area: string | null;
  instructions: string | null;
  recurrence_interval_months: number | null;
  due_date: string;
  reminder_date: string | null;
  notification_channel: ReminderChannel | null;
  vendor_id: string | null;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
};

type VendorRow = {
  id: string;
  company: string;
};

const taskSelect = "id,title,area,instructions,recurrence_interval_months,due_date,reminder_date,notification_channel,vendor_id,priority,status";

function cadenceToMonths(cadence: string) {
  if (cadence === "Monthly") return 1;
  if (cadence === "Every 6 months") return 6;
  if (cadence === "Annually") return 12;
  return 3;
}

function monthsToCadence(months?: number | null) {
  if (months === 1) return "Monthly";
  if (months === 6) return "Every 6 months";
  if (months === 12) return "Annually";
  return "Every 3 months";
}

function mapTask(row: MaintenanceTaskRow): MaintenanceTask {
  return {
    id: row.id,
    title: row.title,
    area: row.area || "General",
    notes: row.instructions || undefined,
    cadence: monthsToCadence(row.recurrence_interval_months),
    dueDate: row.due_date,
    reminderDate: row.reminder_date || undefined,
    reminderChannel: row.notification_channel || "email",
    assignedVendorId: row.vendor_id || undefined,
    priority: row.priority,
    status: row.status,
  };
}

export function MaintenanceBoard() {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState(maintenanceTasks);
  const [vendorOptions, setVendorOptions] = useState(vendors.map((vendor) => ({ id: vendor.id, company: vendor.company })));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTask);
  const [notice, setNotice] = useState("Reminder delivery is ready for email, SMS, push, and calendar export.");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const client = supabase;
    let isMounted = true;

    async function loadRecords() {
      const { data: sessionData } = await client.auth.getSession();
      const activeUserId = sessionData.session?.user.id;

      if (!activeUserId) {
        if (isMounted) setNotice("Demo mode. Login to sync maintenance reminders to your account.");
        return;
      }

      setUserId(activeUserId);
      const [taskResult, vendorResult] = await Promise.all([
        client
          .from("maintenance_tasks")
          .select(taskSelect)
          .eq("user_id", activeUserId)
          .order("due_date", { ascending: true }),
        client
          .from("vendors")
          .select("id,company")
          .eq("user_id", activeUserId)
          .order("company", { ascending: true }),
      ]);

      if (!isMounted) return;

      if (taskResult.error) {
        setNotice(`Maintenance sync error: ${taskResult.error.message}`);
        return;
      }

      if (vendorResult.error) {
        setNotice(`Vendor sync warning: ${vendorResult.error.message}`);
      }

      setTasks((taskResult.data || []).map((row) => mapTask(row as MaintenanceTaskRow)));
      setVendorOptions((vendorResult.data || []).map((row) => row as VendorRow));
      setNotice("Synced with your account. Maintenance reminders save automatically.");
    }

    loadRecords();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const addTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.area.trim()) return;

    const nextTask: MaintenanceTask = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      area: form.area.trim(),
      notes: form.notes.trim() || undefined,
      cadence: form.cadence,
      dueDate: form.dueDate,
      reminderDate: form.reminderDate || undefined,
      reminderChannel: form.reminderChannel,
      assignedVendorId: form.assignedVendorId || undefined,
      priority: form.priority,
      status: form.status,
    };

    if (supabase && userId) {
      setIsSaving(true);
      const payload = {
        user_id: userId,
        title: nextTask.title,
        area: nextTask.area,
        instructions: nextTask.notes || null,
        recurrence_interval_months: cadenceToMonths(nextTask.cadence),
        due_date: nextTask.dueDate,
        reminder_date: nextTask.reminderDate || null,
        notification_channel: nextTask.reminderChannel || "email",
        vendor_id: nextTask.assignedVendorId || null,
        priority: nextTask.priority,
        status: nextTask.status,
      };
      const request = editingTaskId
        ? supabase.from("maintenance_tasks").update(payload).eq("id", editingTaskId).eq("user_id", userId).select(taskSelect).single()
        : supabase.from("maintenance_tasks").insert(payload).select(taskSelect).single();
      const { data, error } = await request;
      setIsSaving(false);

      if (error) {
        setNotice(`Could not save reminder: ${error.message}`);
        return;
      }

      const saved = mapTask(data as MaintenanceTaskRow);
      setTasks((current) => (editingTaskId ? current.map((task) => (task.id === editingTaskId ? saved : task)) : [saved, ...current]));
      setForm(emptyTask);
      setEditingTaskId(null);
      setIsModalOpen(false);
      setNotice(`${saved.title} ${editingTaskId ? "updated" : "saved"} at ${formatTimestamp(new Date().toISOString())}. Form cleared.`);
      return;
    }

    setTasks((current) => {
      if (!editingTaskId) return [nextTask, ...current];
      return current.map((task) => (task.id === editingTaskId ? { ...nextTask, id: editingTaskId } : task));
    });
    setForm(emptyTask);
    setEditingTaskId(null);
    setIsModalOpen(false);
    setNotice(`${nextTask.title} ${editingTaskId ? "updated" : "saved"} at ${formatTimestamp(new Date().toISOString())} with ${nextTask.reminderChannel || "email"} reminder delivery. Form cleared.`);
  };

  const editTask = (task: MaintenanceTask) => {
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      area: task.area,
      cadence: task.cadence,
      dueDate: task.dueDate,
      reminderDate: task.reminderDate || "",
      reminderChannel: task.reminderChannel || "email",
      assignedVendorId: task.assignedVendorId || "",
      notes: task.notes || "",
      priority: task.priority,
      status: task.status,
    });
    setIsModalOpen(true);
  };

  const deleteTask = async (task: MaintenanceTask) => {
    if (supabase && userId && !task.id.startsWith("task-")) {
      setDeletingId(task.id);
      const { error } = await supabase.from("maintenance_tasks").delete().eq("id", task.id).eq("user_id", userId);
      setDeletingId(null);

      if (error) {
        setNotice(`Could not delete reminder: ${error.message}`);
        return;
      }
    }

    setTasks((current) => current.filter((item) => item.id !== task.id));
    setNotice(`${task.title} deleted from maintenance schedule.`);
  };

  const sendTestReminder = (task: MaintenanceTask) => {
    const channel = task.reminderChannel || "email";
    setNotice(`Prepared ${channel.toUpperCase()} reminder for "${task.title}". Connect provider keys in Settings to send automatically.`);
  };

  const downloadCalendarEvent = (task: MaintenanceTask) => {
    const start = task.dueDate.replaceAll("-", "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DomiVault//Maintenance//EN",
      "BEGIN:VEVENT",
      `UID:${task.id}@domivault.local`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `SUMMARY:${task.title}`,
      `DESCRIPTION:${task.area} - ${task.cadence}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    link.download = `${task.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice(`Calendar file created for "${task.title}".`);
  };

  const openGoogleCalendar = (task: MaintenanceTask) => {
    window.open(createGoogleCalendarMaintenanceUrl(task), "_blank", "noopener,noreferrer");
    setNotice(`Opened Google Calendar event draft for "${task.title}". Review it, then save it in Google Calendar.`);
  };

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Maintenance scheduler</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Recurring routines, reminders, and service contacts</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Schedule repairs, assign vendors, and set reminder channels before tasks become urgent.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Schedule Reminder
          </button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {tasks.map((task) => {
          const vendor = vendorOptions.find((item) => item.id === task.assignedVendorId);

          return (
            <article key={task.id} className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05]">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <Badge tone={statusTone[task.status]}>{task.status}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{task.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {task.area} - {task.cadence}
              </p>
              {task.notes && (
                <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Notes: </span>
                  {task.notes}
                </div>
              )}
              <div className="mt-5 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Bell className="h-4 w-4" />
                    Reminder
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{task.reminderDate || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    {(task.reminderChannel || "email") === "sms" ? <MessageSquareText className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    Delivery
                  </span>
                  <span className="font-semibold uppercase text-slate-900 dark:text-white">{task.reminderChannel || "email"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <UsersRound className="h-4 w-4" />
                    Vendor
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{vendor?.company || "Unassigned"}</span>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Due {task.dueDate}</span>
                <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
              </div>
              <div className="mt-4 grid gap-2">
                <button onClick={() => openGoogleCalendar(task)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <CalendarPlus className="h-4 w-4" />
                  Add to Google Calendar
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={() => sendTestReminder(task)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                  <Bell className="h-4 w-4" />
                  Test
                </button>
                <button onClick={() => downloadCalendarEvent(task)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
                  <CalendarPlus className="h-4 w-4" />
                  .ics file
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={() => editTask(task)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button disabled={deletingId === task.id} onClick={() => deleteTask(task)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 text-sm font-semibold text-rose-700 transition-all duration-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-400/20 dark:text-rose-200 dark:hover:bg-rose-400/10">
                  <Trash2 className="h-4 w-4" />
                  {deletingId === task.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
        {notice}
      </div>

      <PremiumLock title="Automatic Google Calendar sync and maintenance history" description="Free accounts can create Google Calendar event drafts from each maintenance card. DomiVault Plus will unlock automatic two-way calendar sync, completed maintenance history, and exportable service records." />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={addTask} className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white p-6 shadow-glass dark:border-white/10 dark:bg-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">New reminder</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{editingTaskId ? "Edit repair or maintenance" : "Schedule repair or maintenance"}</h3>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingTaskId(null); setForm(emptyTask); }} type="button" className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Task title">
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="input" placeholder="Service HVAC system" />
              </Field>
              <Field label="Area">
                <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} className="input" placeholder="Mechanical, Kitchen, Exterior" />
              </Field>
              <Field label="Cadence">
                <select value={form.cadence} onChange={(event) => setForm({ ...form, cadence: event.target.value })} className="input">
                  <option>One-time repair</option>
                  <option>Monthly</option>
                  <option>Every 3 months</option>
                  <option>Every 6 months</option>
                  <option>Annually</option>
                </select>
              </Field>
              <Field label="Assigned vendor">
                <select value={form.assignedVendorId} onChange={(event) => setForm({ ...form, assignedVendorId: event.target.value })} className="input">
                  <option value="">Unassigned</option>
                  {vendorOptions.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.company}</option>)}
                </select>
              </Field>
              <Field label="Due date">
                <input value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="input" type="date" />
              </Field>
              <Field label="Reminder date">
                <input value={form.reminderDate} onChange={(event) => setForm({ ...form, reminderDate: event.target.value })} className="input" type="date" />
              </Field>
              <Field label="Reminder channel">
                <select value={form.reminderChannel} onChange={(event) => setForm({ ...form, reminderChannel: event.target.value as ReminderChannel })} className="input">
                  <option value="email">Email</option>
                  <option value="push">Push</option>
                  <option value="sms">SMS</option>
                </select>
              </Field>
              <Field label="Priority">
                <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as MaintenancePriority })} className="input">
                  <option value="recommended">Recommended</option>
                  <option value="critical">Critical</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </Field>
              <Field label="Notes">
                <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="input min-h-24 md:col-span-2" placeholder="Tools, prep steps, parts, warranty details, or safety notes" />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setIsModalOpen(false); setEditingTaskId(null); setForm(emptyTask); }} type="button" className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                Cancel
              </button>
              <button disabled={isSaving} type="submit" className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950">
                {isSaving ? "Saving..." : editingTaskId ? "Update reminder" : "Save reminder"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
      {children}
    </label>
  );
}
