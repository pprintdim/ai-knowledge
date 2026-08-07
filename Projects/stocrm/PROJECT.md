# stocrm (Mechora) — PROJECT

- **Repo**: `pprintdim/stocrm` (`main` = Laravel; `lovable` = React UI джерело); локально `/Applications/MAMP/htdocs/stocrm`
- **Stack**: Laravel 13 + Inertia.js + React + TypeScript — міні-CRM для СТО
- **Прод**: Hetzner `46.224.100.254` (той самий сервер, що hydrophob.net), CloudPanel :8443, домен `sto.pprintdim.com`
- **Патерн розробки** (стояча інструкція): модель за моделлю повним стеком — міграція → модель (`toFrontendArray`) → Policy → Form Request → контролер → реальні Inertia props (не mock) → curl CRUD-перевірка по ролях → коміт → періодичний деплой
- **Ключова архітектура**: `WorkOrderCalculatorService` — ЄДИНЕ джерело фінансових формул (не дублювати на фронті); `WorkOrderStatusService` (переходи+снапшот); `SequenceGenerator` (лочена нумерація WO-YYYY-NNNNNN); `InventoryService` з `lockForUpdate`; закупівельна ціна прихована від ролі механіка
- **Реалізовано**: Client, Vehicle (VIN/держномер дублікати з override), Appointment (конфлікт-детекція механіка, COALESCE для NULL end_at), RepairWork, Supplier, Part/Stock, WorkOrder повний цикл, Expense/Finance
- Демо живе під `/demo` основного застосунку (Revert-коміт 08-03)

Актуальний стан — `handoff.md` в корені repo (першоджерело, детальний).
