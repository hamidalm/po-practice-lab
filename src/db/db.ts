import Dexie, { type Table } from 'dexie';
import type { Comment, InboxMessage, Issue, IssueLink, MetaRow, Page, Sprint } from './types';

export class PoLabDB extends Dexie {
  issues!: Table<Issue, string>;
  links!: Table<IssueLink, string>;
  comments!: Table<Comment, string>;
  sprints!: Table<Sprint, string>;
  pages!: Table<Page, string>;
  inbox!: Table<InboxMessage, string>;
  meta!: Table<MetaRow, string>;

  constructor() {
    super('po-practice-lab');
    this.version(1).stores({
      issues: 'id, key, type, status, rank',
      links: 'id, fromId, toId, type',
      comments: 'id, issueId, createdAt',
      sprints: 'id, state',
      pages: 'id, updatedAt',
      inbox: 'id, receivedAt',
      meta: 'key',
    });
  }
}

export const db = new PoLabDB();

export const TABLES = ['issues', 'links', 'comments', 'sprints', 'pages', 'inbox', 'meta'] as const;
export type TableName = (typeof TABLES)[number];
