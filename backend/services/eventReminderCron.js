/**
 * eventReminderCron.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Scheduled cron job — runs once daily at 08:00 (server local time).
 *
 * Logic:
 *   1. Find all upcoming events whose eventDate is exactly 5 days from today.
 *   2. For each such event, fetch all registered devotees.
 *   3. Email every devotee an event-reminder notification.
 *
 * Dependency: node-cron  (npm install node-cron)
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use strict";

const cron  = require("node-cron");
const Event = require("../models/Event");
const Devotee = require("../models/Devotee");
const { sendEventReminderEmail } = require("../services/mailService");

/**
 * Core reminder logic — exported so it can be triggered manually in tests.
 */
const runEventReminderJob = async () => {
  console.log("[eventReminderCron][INFO] Running daily event-reminder check…");

  try {
    const now = new Date();

    // ── Compute the target date window (exactly 5 days from now, full day) ──
    const targetStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 5,
      0, 0, 0, 0
    );
    const targetEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 5,
      23, 59, 59, 999
    );

    // ── Find events starting in that window ──
    const events = await Event.find({
      eventDate: { $gte: targetStart, $lte: targetEnd },
      isPublished: true,
      status: { $in: ["upcoming", "ongoing"] },
    }).lean();

    if (!events.length) {
      console.log("[eventReminderCron][INFO] No events found starting in 5 days. Nothing to do.");
      return;
    }

    console.log(
      `[eventReminderCron][INFO] Found ${events.length} event(s) starting in 5 days.`
    );

    // ── Fetch all registered devotees ──
    const users = await Devotee.find({}, "name email").lean();
    if (!users.length) {
      console.log("[eventReminderCron][INFO] No registered users — skipping reminder emails.");
      return;
    }

    // ── Send reminder emails for each event to every user ──
    for (const event of events) {
      const formattedDate = new Date(event.eventDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day:     "2-digit",
        month:   "long",
        year:    "numeric",
      });

      console.log(
        `[eventReminderCron][INFO] Sending reminders for "${event.title}" to ${users.length} user(s)…`
      );

      const results = await Promise.allSettled(
        users.map((u) =>
          sendEventReminderEmail(
            u.email,
            u.name || "Devotee",
            event.title,
            formattedDate,
            event.location || "Ashram Premises"
          )
        )
      );

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length) {
        console.warn(
          `[eventReminderCron][WARN] ${failed.length} reminder email(s) failed for "${event.title}".`
        );
      } else {
        console.log(
          `[eventReminderCron][INFO] All reminders sent for "${event.title}".`
        );
      }
    }
  } catch (err) {
    console.error("[eventReminderCron][ERROR] Job failed:", err.message);
  }
};

/**
 * Register the cron schedule.
 * Schedule: "0 8 * * *"  →  08:00 every day
 *
 * Call this once from server.js after the database connection is established.
 */
const startEventReminderCron = () => {
  cron.schedule("0 8 * * *", runEventReminderJob, {
    timezone: "Asia/Kolkata", // IST — adjust if needed
  });
  console.log(
    "[eventReminderCron][INFO] Event reminder cron job scheduled — runs daily at 08:00 IST."
  );
};

module.exports = { startEventReminderCron, runEventReminderJob };
