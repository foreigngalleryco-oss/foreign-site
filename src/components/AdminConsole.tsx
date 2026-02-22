"use client";

import { useEffect, useState } from "react";

type Role = {
  key: string;
  label: string;
  permissions: string[];
};

type Assignment = {
  userId: string;
  phone: string;
  role: string;
};

export function AdminConsole() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("admin");
  const [status, setStatus] = useState<string>("");

  async function loadData() {
    const response = await fetch("/api/admin/assignments", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) {
      setRoles(data.roles || []);
      setAssignments(data.assignments || []);
      if (data.roles?.[0]?.key) {
        setRole((previous) => previous || data.roles[0].key);
      }
    } else {
      setStatus(data.error || "Failed to load admin data.");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function assignRole() {
    setStatus("Saving role assignment...");
    const response = await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, roleKey: role })
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || "Failed to assign role.");
      return;
    }

    setStatus("Role assigned.");
    setPhone("");
    await loadData();
  }

  async function removeRole(targetPhone: string, roleKey: string) {
    setStatus("Removing role...");
    const response = await fetch("/api/admin/assignments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: targetPhone, roleKey })
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || "Failed to remove role.");
      return;
    }

    setStatus("Role removed.");
    await loadData();
  }

  return (
    <section className="admin-grid">
      <article className="card">
        <h2>Role Assignment</h2>
        <p>Grant specific role access to phone numbers and account holders.</p>

        <label htmlFor="assign-phone">Phone Number</label>
        <input
          id="assign-phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+1 555 555 0102"
        />

        <label htmlFor="assign-role">Role</label>
        <select id="assign-role" value={role} onChange={(event) => setRole(event.target.value)}>
          {roles.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label} ({item.key})
            </option>
          ))}
        </select>

        <button onClick={assignRole}>Assign Role</button>
        {status ? <p className="status hint">{status}</p> : null}
      </article>

      <article className="card">
        <h2>Roles and Permissions</h2>
        <ul className="tag-list">
          {roles.map((item) => (
            <li key={item.key}>
              <strong>{item.label}</strong> <span>({item.key})</span>
              <small>{item.permissions.length ? item.permissions.join(", ") : "No permissions"}</small>
            </li>
          ))}
        </ul>
      </article>

      <article className="card card-wide">
        <h2>Current Assignments</h2>
        <div className="assignment-list">
          {assignments.map((item) => (
            <div key={`${item.userId}-${item.role}`} className="assignment-row">
              <span>{item.phone}</span>
              <span>{item.role}</span>
              <button className="secondary" onClick={() => removeRole(item.phone, item.role)}>
                Remove
              </button>
            </div>
          ))}
          {!assignments.length ? <p>No assigned roles yet.</p> : null}
        </div>
      </article>
    </section>
  );
}
