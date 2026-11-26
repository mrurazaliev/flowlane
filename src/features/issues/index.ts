// Публичный API фичи issues (Dev 1). Другие фичи импортируют ТОЛЬКО отсюда:
//   import { IssueList } from "@/features/issues";
export { Board } from "./components/board";
export { IssuesPage } from "./components/issues-page";
export { IssueDetail } from "./components/issue-detail";
export { IssueList, type IssueListFilter } from "./components/issue-list";
export { AddIssuesModal } from "./components/add-issues-modal";
