import { relations } from "drizzle-orm/relations";
import { user, account, auditLogs, conversations, emotionLogs, messages, moodEntries, subscriptions, payments, reports, session, subscriptionPlans } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	auditLogs: many(auditLogs),
	conversations: many(conversations),
	emotionLogs: many(emotionLogs),
	moodEntries: many(moodEntries),
	payments: many(payments),
	reports: many(reports),
	sessions: many(session),
	subscriptions: many(subscriptions),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(user, {
		fields: [auditLogs.userId],
		references: [user.id]
	}),
}));

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	user: one(user, {
		fields: [conversations.userId],
		references: [user.id]
	}),
	messages: many(messages),
}));

export const emotionLogsRelations = relations(emotionLogs, ({one}) => ({
	user: one(user, {
		fields: [emotionLogs.userId],
		references: [user.id]
	}),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
}));

export const moodEntriesRelations = relations(moodEntries, ({one}) => ({
	user: one(user, {
		fields: [moodEntries.userId],
		references: [user.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	subscription: one(subscriptions, {
		fields: [payments.subscriptionId],
		references: [subscriptions.id]
	}),
	user: one(user, {
		fields: [payments.userId],
		references: [user.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one, many}) => ({
	payments: many(payments),
	subscriptionPlan: one(subscriptionPlans, {
		fields: [subscriptions.planId],
		references: [subscriptionPlans.id]
	}),
	user: one(user, {
		fields: [subscriptions.userId],
		references: [user.id]
	}),
}));

export const reportsRelations = relations(reports, ({one}) => ({
	user: one(user, {
		fields: [reports.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({many}) => ({
	subscriptions: many(subscriptions),
}));