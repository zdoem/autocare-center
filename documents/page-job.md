# Service Jobs Dashboard (Ralph Loop)

This plan outlines the steps to implement the Service Jobs Dashboard according to the requested workflow and state machine, without breaking existing logic.

## Proposed Changes

### 1. Update API validation schema
#### [MODIFY] `src/lib/validations/serviceJob.ts`
- Update `serviceJobUpdateSchema` to include all valid `JobStatus` enums from the Prisma schema (`RECEIVED`, `APPROVED`, `INSPECTION`, `QC_CHECK`, `WAITING_PAYMENT`, etc.). Currently, it limits updates to only a subset of statuses.

### 2. Update API Route for Multiple Status Filtering
#### [MODIFY] `src/app/api/ops/job/route.ts`
- Modify the `GET` route to support multiple statuses passed via query string (e.g., `status=IN_PROGRESS,INSPECTION,WAITING_PARTS,QC_CHECK`).
- If `status` contains commas, use Prisma's `{ in: status.split(',') }` to filter jobs.

### 3. Implement UI State Mapping and Cancellation Workflow
#### [MODIFY] `src/app/service/jobs/page.tsx`
- **Tab Grouping**: Update `STATUS_TABS` to hold multiple statuses based on the requirement:
  - รอรับรถ = `RECEIVED`, `APPROVED`
  - กำลังซ่อม = `IN_PROGRESS`, `INSPECTION`, `WAITING_PARTS`, `QC_CHECK`
  - รอชำระ = `WAITING_PAYMENT`
  - เสร็จแล้ว = `COMPLETED`, `DELIVERED`
- **Count Calculation**: Update `fetchStatusCounts` to properly accumulate counts across grouped statuses.
- **Cancel Job Workflow**: Implement a `handleCancelJob(jobId: string)` function using `SweetAlert2` for confirmation before sending a `PUT` request to `/api/ops/job/[id]` to update the status to `CANCELLED`.
- **Card Action Buttons & Menus**: Ensure that the button labels and destination routes (`/ops/job/[id]`, `/ops/job/[id]/parts`, `/cash/payment?jobId=[id]`, etc.) match the exact state machine requirement provided.

## Verification Plan

### Automated Tests
- Validate TypeScript compilation (`npm run check` or `tsc --noEmit`).
- Validate that the updated Zod schema allows `PUT` updates for all required statuses.

### Manual Verification
- Open the Service Jobs page and click through each tab to verify correct grouping and counting.
- Trigger the "Cancel Job" action from the menu of a "RECEIVED" job to ensure SweetAlert2 pops up and the job is cancelled.
- Verify that clicking "รับชำระ" goes to `/cash/payment?jobId={jobId}` and "ใบเสร็จ" goes to the print receipt route.

---

## Implementation Details (Completed)

> [!NOTE]
> The implementation of the workflow for the Jobs Dashboard has been successfully completed according to the plan above. Below is a summary for readers and maintainers.

### 1. State Machine & Routing (Frontend)
The Service Jobs Dashboard now enforces the following strict workflow through the `getActionButton` component mapping:
- **RECEIVED / APPROVED**: Features a primary "เริ่มงาน" (Start Job) button that navigates directly to `/ops/job/[id]`. The three-dot dropdown contains a "พิมพ์ใบงาน" (Print Job Order) link and an action to "ยกเลิก" (Cancel) the job.
- **IN_PROGRESS / INSPECTION / WAITING_PARTS / QC_CHECK**: The main button changes to "เสร็จสิ้น" (Finish/View Work) navigating to `/ops/job/[id]`. The dropdown contains an option to "เบิกอะไหล่" (Request Parts) via `/ops/job/[id]/parts`.
- **WAITING_PAYMENT**: The UI indicates waiting for payment. The primary action is "รับชำระ" (Receive Payment) which securely links to `/cash/payment?jobId=[id]`. The menu includes an option to "พิมพ์ใบเสนอราคา" (Print Quotation).
- **COMPLETED / DELIVERED**: The dashboard automatically shows a "ชำระแล้ว" (Paid) badge if applicable. The main action allows printing the "ใบเสร็จ" (Receipt) via `/ops/job/print/[id]?type=receipt`.

### 2. Tab Navigation & API Optimization (Backend & Frontend)
- The frontend `STATUS_TABS` array was updated to logically group statuses into core UI categories (e.g., *ทั้งหมด, รอรับรถ, กำลังซ่อม, รอชำระ, เสร็จแล้ว*). Each tab maps an array of valid Prisma `JobStatus` values.
- When querying jobs or updating badges, the frontend sends a comma-separated list of statuses via the URL parameter (e.g., `status=IN_PROGRESS,INSPECTION`). 
- The backend API (`src/app/api/ops/job/route.ts`) was refactored to seamlessly support the `in` query operator in Prisma when a comma-delimited `status` parameter is received.

### 3. Safe Cancellations with Zod Validation
- The schema logic in `src/lib/validations/serviceJob.ts` was aligned precisely with Prisma's `JobStatus` definitions to permit safe and validated `PUT` requests for updating a job's status.
- A robust `handleCancelJob` method was added to the UI, utilizing **SweetAlert2** to confirm the user's intent to cancel. Once confirmed, it invokes a RESTful `PUT` call to the server to safely transition the job state to `CANCELLED` without affecting existing relational data.
