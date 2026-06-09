# 10. Wireframes

## 10.1 Login Page

```
┌──────────────────────────────────────────────────────────────────┐
│                                                    [AR] [EN] 🌐 │
│                                                                  │
│                                                                  │
│                        ┌──────────────┐                          │
│                        │  ClinicDesk  │                          │
│                        │     LOGO     │                          │
│                        └──────────────┘                          │
│                                                                  │
│                    Welcome to ClinicDesk                          │
│               Clinic Management Made Simple                      │
│                                                                  │
│              ┌──────────────────────────────┐                    │
│              │  Email Address               │                    │
│              └──────────────────────────────┘                    │
│                                                                  │
│              ┌──────────────────────────────┐                    │
│              │  Password                    │                    │
│              └──────────────────────────────┘                    │
│                                                                  │
│              [ ] Remember me      Forgot Password?               │
│                                                                  │
│              ┌──────────────────────────────┐                    │
│              │          LOG IN              │                    │
│              └──────────────────────────────┘                    │
│                                                                  │
│              Don't have an account? Register                     │
│                                                                  │
│                     (c) 2026 ClinicDesk                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10.2 Dashboard - Admin View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ClinicDesk                              Search...        [bell] Admin v   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  Dashboard   │  Good Morning, Admin                      June 9, 2026      │
│              │                                                              │
│  Patients    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│              │  │   1,250  │ │    28    │ │   8,500  │ │    12    │       │
│  Appointments│  │  Total   │ │  Today   │ │ Revenue  │ │ Pending  │       │
│              │  │ Patients │ │  Appts   │ │  Today   │ │ Invoices │       │
│  Visits      │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│              │                                                              │
│  Prescrip.   │  ┌──────────────────────────┐  ┌─────────────────────┐      │
│              │  │  Revenue Overview (Week)  │  │  Quick Actions      │      │
│  Billing     │  │                          │  │                     │      │
│              │  │  8k |        __           │  │  [+ New Patient]    │      │
│  Reports     │  │  6k |   __ |  |__        │  │  [+ New Appt.]      │      │
│              │  │  4k |__|  ||  |  |__     │  │  [+ New Invoice]    │      │
│  Settings    │  │  2k |  |  ||  |  |  |    │  │  [View Schedule]    │      │
│              │  │     M  Tu  W  Th  F      │  │                     │      │
│  Users       │  └──────────────────────────┘  └─────────────────────┘      │
│              │                                                              │
│  Audit Log   │  ┌──────────────────────────────────────────────────────┐   │
│              │  │  Today's Appointments                    [View All]  │   │
│              │  ├───────┬──────────┬──────────┬─────────┬──────┬──────┤   │
│              │  │ Time  │ Patient  │ Doctor   │ Service │Status│Action│   │
│              │  ├───────┼──────────┼──────────┼─────────┼──────┼──────┤   │
│              │  │ 09:00 │ Omar K.  │ Dr.Ahmed │ General │ Conf │ View │   │
│              │  │ 09:30 │ Fatima S.│ Dr.Ahmed │ Follow  │ Wait │ View │   │
│              │  │ 10:00 │ Ali H.   │ Dr.Sara  │ Dental  │ Schd │ View │   │
│              │  │ 10:30 │ Nour M.  │ Dr.Sara  │ General │ Schd │ View │   │
│              │  └───────┴──────────┴──────────┴─────────┴──────┴──────┘   │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 10.3 Dashboard - Doctor View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ClinicDesk                              Search...     [bell] Dr.Ahmed v   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  Dashboard   │  Good Morning, Dr. Ahmed                  June 9, 2026      │
│              │                                                              │
│  Schedule    │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│              │  │     12       │ │      5       │ │      7       │        │
│  My Visits   │  │   Today's    │ │  Completed   │ │  Remaining   │        │
│              │  │  Patients    │ │   Visits     │ │   Visits     │        │
│  Prescrip.   │  └──────────────┘ └──────────────┘ └──────────────┘        │
│              │                                                              │
│  Patients    │  ┌──────────────────────────────────────────────────────┐   │
│              │  │  Today's Schedule                                    │   │
│              │  ├──────┬───────────────┬───────────┬────────┬─────────┤   │
│              │  │ Time │ Patient       │ Service   │ Status │ Action  │   │
│              │  ├──────┼───────────────┼───────────┼────────┼─────────┤   │
│              │  │09:00 │ Omar Khalid   │ General   │  Done  │ Review  │   │
│              │  │09:30 │ Fatima Salem  │ Follow-up │  Done  │ Review  │   │
│              │  │10:00 │ Ali Hassan    │ General   │  Done  │ Review  │   │
│              │  │10:30 │ Nour Mahmoud  │ Checkup   │  Done  │ Review  │   │
│              │  │11:00 │ Hassan Tarek  │ Cardio    │  Done  │ Review  │   │
│              │  │11:30 │ Maryam Ali    │ General   │ Active │ Start   │   │
│              │  │14:00 │ Youssef Omar  │ Follow-up │ Sched  │Check-in │   │
│              │  └──────┴───────────────┴───────────┴────────┴─────────┘   │
│              │                                                              │
│              │  ┌────────────────────────┐  ┌────────────────────────┐     │
│              │  │ Recent Prescriptions   │  │ Recent Visits          │     │
│              │  │ - Omar K. Sumatriptan  │  │ - Fatima S. Migraine   │     │
│              │  │ - Ali H. Amoxicillin   │  │ - Ali H. Infection     │     │
│              │  │ - Nour M. Metformin    │  │ - Nour M. Diabetes     │     │
│              │  │        [View All]      │  │        [View All]      │     │
│              │  └────────────────────────┘  └────────────────────────┘     │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 10.4 Patient List

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ClinicDesk                              Search...        [bell] Admin v   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  Dashboard   │  Patient Management                      [+ Add Patient]    │
│              │                                                              │
│  Patients    │  ┌────────────────────────────┐ [All] [Male] [Female]       │
│   > List     │  │ Search by name, ID, phone  │ [Blood Type v] [Date v]     │
│   > Add New  │  └────────────────────────────┘                              │
│              │                                                              │
│  Appointments│  ┌──────────────────────────────────────────────────────┐   │
│              │  │  Showing 1-20 of 1,250 patients          Export CSV  │   │
│  Visits      │  ├────┬──────────────┬──────────┬─────────┬──────┬─────┤   │
│              │  │ #  │ Patient Name │ Nat. ID  │ Phone   │ Last │ Act │   │
│  Prescrip.   │  │    │              │          │         │ Visit│     │   │
│              │  ├────┼──────────────┼──────────┼─────────┼──────┼─────┤   │
│  Billing     │  │ 1  │ Omar Khalid  │ 1234567  │ +966-50 │ Jun 8│ V E │   │
│              │  │ 2  │ Fatima Salem │ 2345678  │ +966-50 │ Jun 7│ V E │   │
│  Reports     │  │ 3  │ Ali Hassan   │ 3456789  │ +966-50 │ Jun 5│ V E │   │
│              │  │ 4  │ Nour Mahmoud │ 4567890  │ +966-50 │ Jun 3│ V E │   │
│  Settings    │  │ 5  │ Hassan Tarek │ 5678901  │ +966-50 │ Jun 1│ V E │   │
│              │  │ 6  │ Maryam Ali   │ 6789012  │ +966-50 │ May28│ V E │   │
│              │  │ 7  │ Youssef Omar │ 7890123  │ +966-50 │ May25│ V E │   │
│              │  │ 8  │ Layla Ahmed  │ 8901234  │ +966-50 │ May20│ V E │   │
│              │  └────┴──────────────┴──────────┴─────────┴──────┴─────┘   │
│              │                                                              │
│              │  < Previous  [1] [2] [3] ... [63]  Next >   20 per page v   │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 10.5 Patient Details

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ClinicDesk                              Search...        [bell] Admin v   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  Dashboard   │  < Back to Patients                        [Edit] [Delete]  │
│              │                                                              │
│  Patients    │  ┌──────────────────────────────────────────────────────┐   │
│              │  │  Omar Khalid                                         │   │
│  Appointments│  │                                                      │   │
│              │  │  Email: omar@email.com     Phone: +966-509-876-543   │   │
│  Visits      │  │  ID: 1234567890   DOB: May 15, 1990 (36yrs)  Male   │   │
│              │  │  Address: 123 King Fahd Road, Riyadh                 │   │
│  Prescrip.   │  │  Allergies: Penicillin                               │   │
│              │  │  Emergency: Fatima Khalid (+966-501-112-233)          │   │
│  Billing     │  │  Blood Type: O+                                      │   │
│              │  └──────────────────────────────────────────────────────┘   │
│              │                                                              │
│              │  [Profile] [Appointments] [Visits] [Prescriptions] [Billing]│
│              │  ============================================================│
│              │                                                              │
│              │  ┌──────────────────────────────────────────────────────┐   │
│              │  │  Appointment History                    [+ Book New] │   │
│              │  ├──────────┬──────────┬──────────┬────────┬──────────┤   │
│              │  │ Date     │ Doctor   │ Service  │ Status │ Action   │   │
│              │  ├──────────┼──────────┼──────────┼────────┼──────────┤   │
│              │  │ Jun 15   │ Dr.Ahmed │ General  │ Sched  │  View    │   │
│              │  │ Jun 8    │ Dr.Ahmed │ Follow   │ Done   │  View    │   │
│              │  │ May 20   │ Dr.Sara  │ Dental   │ Done   │  View    │   │
│              │  │ Apr 10   │ Dr.Ahmed │ Checkup  │ Done   │  View    │   │
│              │  └──────────┴──────────┴──────────┴────────┴──────────┘   │
│              │                                                              │
│              │  Medical Notes: No known chronic conditions                  │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 10.6 Appointment Calendar

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ClinicDesk                              Search...        [bell] Admin v   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  Dashboard   │  Appointment Calendar                 [+ New Appointment]   │
│              │                                                              │
│  Patients    │  < June 2026 >          [Month] [Week] [Day]  [Doctor v]    │
│              │                                                              │
│  Appointments│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐        │
│   > Calendar │  │ Sun  │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │        │
│   > List     │  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤        │
│              │  │      │  1   │  2   │  3   │  4   │  5   │  6   │        │
│  Visits      │  │      │  5   │  8   │  6   │  10  │  3   │      │        │
│              │  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤        │
│  Prescrip.   │  │  7   │  8   │ [9]  │  10  │  11  │  12  │  13  │        │
│              │  │      │  7   │  12  │  4   │  9   │  5   │      │        │
│  Billing     │  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤        │
│              │  │  14  │  15  │  16  │  17  │  18  │  19  │  20  │        │
│  Reports     │  │      │  8   │  6   │  5   │  7   │  4   │      │        │
│              │  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤        │
│              │  │  21  │  22  │  23  │  24  │  25  │  26  │  27  │        │
│              │  │      │  3   │  5   │      │  4   │  2   │      │        │
│              │  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤        │
│              │  │  28  │  29  │  30  │      │      │      │      │        │
│              │  │      │  4   │  3   │      │      │      │      │        │
│              │  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘        │
│              │                                                              │
│              │  Legend: Green=Completed Blue=Scheduled Yellow=Checked-in    │
│              │                                                              │
│              │  ┌────────────────────────────────────┐                     │
│              │  │  June 9 - 12 Appointments          │                     │
│              │  │  09:00 Omar Khalid    Checked-in   │                     │
│              │  │  09:30 Fatima Salem   Scheduled     │                     │
│              │  │  10:00 Ali Hassan     Scheduled     │                     │
│              │  └────────────────────────────────────┘                     │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 10.7 Visit / Examination Form

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ClinicDesk                              Search...     [bell] Dr.Ahmed v   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  Dashboard   │  Visit Record                    [Save Draft] [Complete]    │
│              │  < Back to Schedule                                          │
│  Schedule    │                                                              │
│              │  ┌──────────────────────────────────────────────────────┐   │
│  My Visits   │  │ Omar Khalid | ID: 1234567890 | O+ | Allergy: Pen.  │   │
│              │  │ 36 yrs Male | Jun 9, 2026 | General Consultation    │   │
│  Prescrip.   │  └──────────────────────────────────────────────────────┘   │
│              │                                                              │
│  Patients    │  --- Vital Signs ---                                        │
│              │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│              │  │ BP          │ │ Temp        │ │ Pulse       │          │
│              │  │ [130/85   ] │ │ [37.2  C  ] │ │ [78    bpm] │          │
│              │  └─────────────┘ └─────────────┘ └─────────────┘          │
│              │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│              │  │ Resp. Rate  │ │ Weight      │ │ SpO2        │          │
│              │  │ [16   /min] │ │ [82.5  kg ] │ │ [98      %] │          │
│              │  └─────────────┘ └─────────────┘ └─────────────┘          │
│              │                                                              │
│              │  --- Chief Complaint ---                                     │
│              │  ┌──────────────────────────────────────────────────────┐   │
│              │  │ Patient reports persistent headaches for 2 weeks    │   │
│              │  └──────────────────────────────────────────────────────┘   │
│              │                                                              │
│              │  --- Examination Notes ---                                   │
│              │  ┌──────────────────────────────────────────────────────┐   │
│              │  │ Patient appears alert. Mild tenderness in temporal  │   │
│              │  │ region. No neurological deficits observed.          │   │
│              │  └──────────────────────────────────────────────────────┘   │
│              │                                                              │
│              │  --- Diagnoses ---                       [+ Add Diagnosis]  │
│              │  G43.9 - Migraine, unspecified (Primary)                    │
│              │  R51 - Headache                                              │
│              │                                                              │
│              │     [Write Prescription]    [Save]    [Complete Visit]       │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 10.8 Prescription Form

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ClinicDesk                              Search...     [bell] Dr.Ahmed v   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  Dashboard   │  New Prescription                      [Save] [Print]       │
│              │  < Back to Visit                                             │
│  Schedule    │                                                              │
│              │  ┌──────────────────────────────────────────────────────┐   │
│  My Visits   │  │ Omar Khalid | Visit: Jun 9 | Dx: Migraine          │   │
│              │  └──────────────────────────────────────────────────────┘   │
│  Prescrip.   │                                                              │
│              │  --- Medications ---                         [+ Add Row]    │
│              │  ┌────┬────────────┬────────┬────────┬──────┬──────────┐   │
│              │  │ #  │ Medication │ Dosage │Frequncy│ Days │Instructns│   │
│              │  ├────┼────────────┼────────┼────────┼──────┼──────────┤   │
│              │  │ 1  │Sumatriptan │ 50mg   │PRN 2/d │  30  │At onset  │   │
│              │  │ 2  │Ibuprofen   │ 400mg  │ TID    │   7  │After meal│   │
│              │  │ 3  │Metoclopra. │ 10mg   │ PRN    │  14  │Before mea│   │
│              │  │ 4  │ [Select..] │ [    ] │ [    ] │ [  ] │ [      ] │   │
│              │  └────┴────────────┴────────┴────────┴──────┴──────────┘   │
│              │                                                              │
│              │  --- Notes ---                                               │
│              │  ┌──────────────────────────────────────────────────────┐   │
│              │  │ Take all medications with food. Follow up in 2 wks  │   │
│              │  └──────────────────────────────────────────────────────┘   │
│              │                                                              │
│              │         [Cancel]    [Save Draft]    [Save and Print]         │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 10.9 Billing / Invoice Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ClinicDesk                              Search...        [bell] Admin v   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  Dashboard   │  Invoice #INV-2026-0200                    [Edit] [Print]   │
│              │                                                              │
│  Patients    │  ┌────────────────────────┐  ┌──────────────────────────┐   │
│              │  │  Invoice Details       │  │  Patient Information     │   │
│  Appointments│  │  Number: INV-2026-0200 │  │  Name: Omar Khalid       │   │
│              │  │  Date: Jun 15, 2026    │  │  Phone: +966-509-876-543 │   │
│  Visits      │  │  Due: Jul 15, 2026     │  │  ID: 1234567890          │   │
│              │  │  Status: Issued        │  │                          │   │
│  Prescrip.   │  └────────────────────────┘  └──────────────────────────┘   │
│              │                                                              │
│  Billing     │  ┌──────────────────────────────────────────────────────┐   │
│   > Invoices │  │  Line Items                                          │   │
│   > Payments │  ├────┬───────────────────────┬──────┬────────┬────────┤   │
│              │  │ #  │ Description           │ Qty  │ Price  │ Total  │   │
│  Reports     │  ├────┼───────────────────────┼──────┼────────┼────────┤   │
│              │  │ 1  │ General Consultation   │  1   │ 200.00 │ 200.00 │   │
│              │  │ 2  │ ECG Test               │  1   │ 150.00 │ 150.00 │   │
│              │  │ 3  │ BP Monitoring           │  1   │  50.00 │  50.00 │   │
│              │  ├────┴───────────────────────┼──────┼────────┼────────┤   │
│              │  │                    Subtotal │      │        │ 400.00 │   │
│              │  │                  Tax (15%)  │      │        │  60.00 │   │
│              │  │                    Discount │      │        │ -40.00 │   │
│              │  │                      TOTAL  │      │        │ 420.00 │   │
│              │  └────────────────────────────┴──────┴────────┴────────┘   │
│              │                                                              │
│              │  --- Record Payment ---                                      │
│              │  Amount: [420.00]  Method: [Cash v]  Ref: [          ]       │
│              │  Notes:  [Full payment received                    ]         │
│              │                                       [Record Payment]       │
│              │                                                              │
│              │  --- Payment History ---                                     │
│              │  (No payments recorded yet)                                  │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 10.10 Reports Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ClinicDesk                              Search...        [bell] Admin v   │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  Dashboard   │  Reports and Analytics                  [Export PDF/CSV]    │
│              │                                                              │
│  Patients    │  Date Range: [Jun 1, 2026] to [Jun 30, 2026]  [Apply]      │
│              │  View By: [Revenue] [Appointments] [Patients]               │
│  Appointments│                                                              │
│              │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  Visits      │  │  185,000   │ │    320     │ │     45     │ │   12%    │ │
│              │  │  Total Rev │ │ Total Appts│ │ New Patient│ │  Growth  │ │
│  Prescrip.   │  │  SAR       │ │ This Month │ │ This Month │ │  vs Last │ │
│              │  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│  Billing     │                                                              │
│              │  ┌──────────────────────────────────────────────────────┐   │
│  Reports     │  │  Revenue Over Time                                   │   │
│   > Revenue  │  │                                                      │   │
│   > Patients │  │  50k |                    __                         │   │
│   > Appts    │  │  40k |        __    __   |  | __                    │   │
│              │  │  30k |   __  |  |  |  |  |  ||  |                   │   │
│  Settings    │  │  20k |  |  | |  |  |  |  |  ||  |                   │   │
│              │  │  10k |  |  | |  |  |  |  |  ||  |                   │   │
│              │  │       W1    W2    W3    W4   W5                      │   │
│              │  └──────────────────────────────────────────────────────┘   │
│              │                                                              │
│              │  ┌────────────────────────┐  ┌────────────────────────┐     │
│              │  │  By Payment Method     │  │  Appointments by Day   │     │
│              │  │  Cash      ======= 65% │  │  Mon ========== 52     │     │
│              │  │  Card      ====    24% │  │  Tue =========  45     │     │
│              │  │  Insurance ==      11% │  │  Wed ========   40     │     │
│              │  │  Total: SAR 185,000    │  │  Thu =========  48     │     │
│              │  └────────────────────────┘  │  Fri ======     30     │     │
│              │                              └────────────────────────┘     │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

---

# 11. Sprint Planning

## 11.1 Team Composition

| Role | Developer | Primary Responsibilities |
|------|-----------|-------------------------|
| **Backend Lead** | Dev 1 | API architecture, auth module, database schema, middleware |
| **Backend Dev** | Dev 2 | Patient, appointment, visit, prescription modules |
| **Frontend Lead** | Dev 3 | App layout, routing, auth pages, dashboard, design system |
| **Frontend Dev** | Dev 4 | Patient UI, appointment calendar, visit/prescription forms |
| **Full-Stack** | Dev 5 | Billing module (FE+BE), reports, notifications, integration |

## 11.2 Sprint Goal

> **Deliver a functional clinic management MVP** that enables receptionists to register patients and schedule appointments, doctors to record visits and write prescriptions, and admins to generate invoices and view analytics -- supporting both Arabic and English -- by end of Day 5.

## 11.3 Day-by-Day Breakdown

### Day 1 - Foundation (All Hands on Setup)

| Developer | Morning (4 hours) | Afternoon (4 hours) |
|-----------|-------------------|---------------------|
| **Dev 1 (BE Lead)** | Git repo + monorepo setup, Docker Compose (MySQL + API), NestJS scaffolding, database config | TypeORM entities + migrations for all 17 tables, seed data (roles, admin user) |
| **Dev 2 (BE)** | Auth module: register, login, JWT strategy, RBAC guards | Auth module: change-password, refresh-token, profile endpoints |
| **Dev 3 (FE Lead)** | Vite + React scaffolding, Stitch UI Generation setup, i18next config, routing skeleton | Auth pages (Login, Register), ProtectedRoute, AppLayout with sidebar |
| **Dev 4 (FE)** | Design system: CSS variables, theme config, RTL stylesheet | Common components: DataTable, PageHeader, StatusBadge, ConfirmModal, LoadingSpinner |
| **Dev 5 (FS)** | Help Dev 1 with Docker + DB setup, API response standardization | Swagger setup, error handling filter, validation pipe, common DTOs |

**Day 1 Checkpoint:** App boots in Docker, auth works end-to-end (register -> login -> protected route), design system ready.

---

### Day 2 - Core Modules

| Developer | Morning (4 hours) | Afternoon (4 hours) |
|-----------|-------------------|---------------------|
| **Dev 1 (BE Lead)** | Patient CRUD API with search + pagination + filters | Doctor module API, services CRUD |
| **Dev 2 (BE)** | Appointment API: create, list, update, status, available-slots | Appointment conflict detection, calendar data endpoint |
| **Dev 3 (FE Lead)** | Dashboard page (role-based), stats cards, recent activity | Dashboard charts (revenue, appointment count) |
| **Dev 4 (FE)** | Patient list page with DataTable, search, filters | Patient detail page with tabs (profile, appointments, visits) |
| **Dev 5 (FS)** | Patient form (create/edit), integrate with API | Appointment form + list page, integrate with API |

**Day 2 Checkpoint:** Patient CRUD works end-to-end, appointments can be created, dashboard shows real data.

---

### Day 3 - Clinical Workflow

| Developer | Morning (4 hours) | Afternoon (4 hours) |
|-----------|-------------------|---------------------|
| **Dev 1 (BE Lead)** | Visit API: create, update, complete, link to appointment | Diagnosis API, audit log interceptor |
| **Dev 2 (BE)** | Prescription API: create with items, get, update | Prescription print endpoint (HTML-to-PDF) |
| **Dev 3 (FE Lead)** | Appointment calendar page (month/week views) | Calendar day detail sidebar, status color coding |
| **Dev 4 (FE)** | Visit/examination form (vitals, complaint, notes, diagnosis) | Prescription form (medication table, add/remove rows) |
| **Dev 5 (FS)** | Invoice API: create with line items, auto-calculate totals | Invoice UI: create form, detail page, line items table |

**Day 3 Checkpoint:** Full clinical workflow works: appointment -> check-in -> visit -> diagnosis -> prescription. Billing foundation ready.

---

### Day 4 - Billing, Admin and Polish

| Developer | Morning (4 hours) | Afternoon (4 hours) |
|-----------|-------------------|---------------------|
| **Dev 1 (BE Lead)** | Admin API: user management, service management, settings | Audit log endpoints, clinic settings API |
| **Dev 2 (BE)** | Payment recording API, invoice status management | Notification service (in-app), notification API |
| **Dev 3 (FE Lead)** | Arabic translations (all UI strings), RTL layout testing | Admin pages: user management, service management |
| **Dev 4 (FE)** | Invoice detail + payment recording UI | Reports page: revenue chart, summary stats, date filters |
| **Dev 5 (FS)** | Reports API: dashboard stats, revenue, appointments | Notification bell UI, notification dropdown, read/unread |

**Day 4 Checkpoint:** Billing complete, admin panel functional, Arabic/English toggle works, reports show data.

---

### Day 5 - Integration, Polish and Demo

| Developer | Morning (4 hours) | Afternoon (4 hours) |
|-----------|-------------------|---------------------|
| **Dev 1 (BE Lead)** | End-to-end testing, API bug fixes, data seeding for demo | Demo data preparation, deployment to staging |
| **Dev 2 (BE)** | API bug fixes, edge case handling, input validation review | Docker production build, environment config |
| **Dev 3 (FE Lead)** | UI responsiveness, mobile-friendly adjustments | Bug fixes, loading states, error handling polish |
| **Dev 4 (FE)** | Cross-browser testing, UI polish, empty state designs | Demo walkthrough preparation |
| **Dev 5 (FS)** | Integration testing (full workflows), data consistency | Demo script, README documentation |

**Day 5 Checkpoint:** MVP complete, demo-ready, deployed to staging.

---

## 11.4 Task Breakdown

| ID | Task Name | Assignee | Day | SP | Dependencies | Status |
|----|-----------|----------|-----|----|-------------|--------|
| T01 | Git repo + monorepo setup | Dev 1 | 1 | 2 | -- | [ ] |
| T02 | Docker Compose (MySQL + API + Frontend) | Dev 1 | 1 | 3 | -- | [ ] |
| T03 | NestJS project scaffolding | Dev 1 | 1 | 2 | T01 | [ ] |
| T04 | Database config + TypeORM setup | Dev 1 | 1 | 3 | T03 | [ ] |
| T05 | All entity definitions (17 tables) | Dev 1 | 1 | 8 | T04 | [ ] |
| T06 | DB migrations + seed data | Dev 1 | 1 | 5 | T05 | [ ] |
| T07 | Auth module: register + login + JWT | Dev 2 | 1 | 8 | T03 | [ ] |
| T08 | RBAC guards + roles decorator | Dev 2 | 1 | 5 | T07 | [ ] |
| T09 | Auth: refresh-token + change-password | Dev 2 | 1 | 3 | T07 | [ ] |
| T10 | Vite + React project scaffolding | Dev 3 | 1 | 2 | -- | [ ] |
| T11 | Stitch UI Generation + i18next + routing setup | Dev 3 | 1 | 3 | T10 | [ ] |
| T12 | Login + Register pages | Dev 3 | 1 | 5 | T11 | [ ] |
| T13 | AppLayout (sidebar, header, footer) | Dev 3 | 1 | 5 | T11 | [ ] |
| T14 | Design system: CSS vars + theme | Dev 4 | 1 | 3 | T10 | [ ] |
| T15 | Common components (DataTable, etc.) | Dev 4 | 1 | 5 | T14 | [ ] |
| T16 | Swagger setup + API standards | Dev 5 | 1 | 3 | T03 | [ ] |
| T17 | Error filter + validation pipe | Dev 5 | 1 | 3 | T03 | [ ] |
| T18 | Patient CRUD API | Dev 1 | 2 | 5 | T06 | [ ] |
| T19 | Doctor + Services API | Dev 1 | 2 | 5 | T06 | [ ] |
| T20 | Appointment API (CRUD + slots) | Dev 2 | 2 | 8 | T06 | [ ] |
| T21 | Appointment conflict detection | Dev 2 | 2 | 5 | T20 | [ ] |
| T22 | Dashboard page (role-based) | Dev 3 | 2 | 5 | T13 | [ ] |
| T23 | Dashboard charts | Dev 3 | 2 | 3 | T22 | [ ] |
| T24 | Patient list page | Dev 4 | 2 | 5 | T15, T18 | [ ] |
| T25 | Patient detail page with tabs | Dev 4 | 2 | 5 | T24 | [ ] |
| T26 | Patient form (create/edit) | Dev 5 | 2 | 3 | T18 | [ ] |
| T27 | Appointment form + list UI | Dev 5 | 2 | 5 | T20 | [ ] |
| T28 | Visit API (CRUD + status) | Dev 1 | 3 | 5 | T20 | [ ] |
| T29 | Diagnosis API | Dev 1 | 3 | 3 | T28 | [ ] |
| T30 | Prescription API + items | Dev 2 | 3 | 5 | T28 | [ ] |
| T31 | Prescription PDF generation | Dev 2 | 3 | 5 | T30 | [ ] |
| T32 | Appointment calendar page | Dev 3 | 3 | 8 | T20, T15 | [ ] |
| T33 | Visit/examination form | Dev 4 | 3 | 8 | T28, T15 | [ ] |
| T34 | Prescription form | Dev 4 | 3 | 5 | T30 | [ ] |
| T35 | Invoice API (CRUD + calculations) | Dev 5 | 3 | 8 | T06 | [ ] |
| T36 | Invoice UI (form + detail) | Dev 5 | 3 | 5 | T35 | [ ] |
| T37 | Admin API (users, services, settings) | Dev 1 | 4 | 5 | T06 | [ ] |
| T38 | Audit log endpoints | Dev 1 | 4 | 3 | T37 | [ ] |
| T39 | Payment API + invoice status mgmt | Dev 2 | 4 | 5 | T35 | [ ] |
| T40 | Notification service + API | Dev 2 | 4 | 5 | T06 | [ ] |
| T41 | Arabic translations + RTL testing | Dev 3 | 4 | 5 | All FE | [ ] |
| T42 | Admin pages (user mgmt, services) | Dev 3 | 4 | 5 | T37 | [ ] |
| T43 | Invoice detail + payment UI | Dev 4 | 4 | 5 | T39 | [ ] |
| T44 | Reports page (charts + stats) | Dev 4 | 4 | 5 | T15 | [ ] |
| T45 | Reports API (dashboard, revenue) | Dev 5 | 4 | 5 | T35 | [ ] |
| T46 | Notification bell + dropdown UI | Dev 5 | 4 | 3 | T40 | [ ] |
| T47 | End-to-end testing + API fixes | Dev 1 | 5 | 5 | All BE | [ ] |
| T48 | Docker prod build + staging deploy | Dev 2 | 5 | 5 | All | [ ] |
| T49 | UI responsiveness + polish | Dev 3 | 5 | 3 | All FE | [ ] |
| T50 | Cross-browser testing + bug fixes | Dev 4 | 5 | 3 | All FE | [ ] |
| T51 | Integration testing + demo prep | Dev 5 | 5 | 5 | All | [ ] |
| T52 | Demo data seeding + README | Dev 1 | 5 | 3 | T47 | [ ] |

**Total Story Points: ~230 SP across 5 days with 5 developers**

---

## 11.5 Dependencies and Critical Path

```
Critical Path:
T01 -> T03 -> T04 -> T05 -> T06 -> T18/T20 -> T28 -> T30/T35 -> T39 -> T47 -> T48

Key Dependencies:
  All backend modules depend on T06 (DB migrations + seeds)
  All frontend pages depend on T11 (routing) and T15 (common components)
  Visit API (T28) depends on Appointment API (T20)
  Prescription API (T30) depends on Visit API (T28)
  Invoice API (T35) depends on DB setup (T06)
  All Day 5 tasks depend on Days 1-4 completion
```

### Blocker Mitigation

| Blocker | Impact | Mitigation |
|---------|--------|------------|
| DB migration fails | Blocks ALL backend | Dev 1 prioritizes + Dev 5 assists |
| Auth not working | Blocks ALL protected routes | Dev 2 focuses exclusively on Day 1 |
| Frontend scaffold issues | Blocks ALL UI work | Dev 3 pre-tests Vite + Stitch UI Generation setup |
| API contract mismatch | Blocks FE-BE integration | Agree on Swagger specs Day 1 afternoon |

---

## 11.6 Risk Management

| # | Risk | Impact | Probability | Mitigation Strategy |
|---|------|--------|-------------|---------------------|
| 1 | **Scope creep** | High | High | Strict MoSCoW enforcement. Feature freeze after Day 3. Only bug fixes Day 4-5. |
| 2 | **Integration failures** | High | Medium | Define API contracts (Swagger) on Day 1. Use mock data for FE until APIs ready. |
| 3 | **Team member unavailable** | High | Low | Cross-train on Day 1. Each module should have a backup dev who understands it. |
| 4 | **Database schema changes mid-sprint** | Medium | Medium | Finalize schema on Day 1 morning. Use TypeORM migrations for any changes. |
| 5 | **Docker/deployment issues** | Medium | Medium | Dev 1 sets up Docker Day 1 morning. Test docker-compose up before anything else. |

---

---

# 12. MVP Scope Definition (MoSCoW)

## Must Have - Core MVP (Day 5 Deadline)

These features are **required** for the system to be considered functional at the hackathon demo.

| Category | Features |
|----------|----------|
| **Authentication** | User login/register, JWT tokens, refresh tokens, RBAC middleware (4 roles) |
| **Patient Management** | Create/read/update patients, search by name/phone/ID, patient profile view |
| **Appointments** | Create/view/update appointments, status changes (scheduled to confirmed to checked_in to completed), list with filters |
| **Visits** | Create visit from appointment, record vitals (BP, temp, pulse, weight), chief complaint, examination notes |
| **Diagnoses** | Add diagnosis to visit (ICD code, name, notes) |
| **Prescriptions** | Create prescription with medication items (name, dosage, frequency, duration) |
| **Billing** | Create invoices with line items, auto-calculate subtotal/tax/total |
| **Dashboard** | Role-based dashboard with key stats (patient count, today's appointments, revenue) |
| **Localization** | Arabic/English toggle, RTL layout support |
| **Infrastructure** | Docker Compose setup, Swagger API docs, basic error handling |

---

## Should Have - Important but Deferrable

These features significantly improve the product but the MVP can function without them.

| Category | Features |
|----------|----------|
| **Appointments** | Calendar view (month/week/day), available slot checking, conflict detection |
| **Prescriptions** | Print prescription as PDF |
| **Billing** | Record payments, payment history, invoice status management (paid/partial) |
| **Notifications** | In-app notification system (bell icon, unread count, dropdown) |
| **Patient History** | Appointment history tab, visit history tab on patient detail |
| **Search and Filter** | Advanced filtering on all list pages, date range filters |
| **Admin** | User management (create/edit staff), service management |
| **Audit** | Audit logging for critical operations (create, update, delete) |

---

## Could Have - Nice-to-Have Enhancements

These features add polish but are not expected for the hackathon.

| Category | Features |
|----------|----------|
| **Notifications** | Email notifications via nodemailer |
| **Reports** | Export reports as PDF/Excel, advanced analytics charts |
| **Charts** | Revenue over time, appointment trends, patient growth charts |
| **Patient Portal** | Patient self-registration and appointment booking |
| **Reminders** | Automated appointment reminder notifications |
| **UI** | Dark mode theme, advanced animations, data export buttons |
| **Files** | Medical report file uploads and viewing |
| **Clinic Settings** | Customizable working hours, tax rate, clinic branding |

---

## Won't Have - Explicitly Deferred

These features are out of scope for the hackathon and planned for future iterations.

| Category | Features | Rationale |
|----------|----------|-----------|
| **Insurance** | Insurance provider management, claims, coverage | Complex domain, requires external integrations |
| **Multi-Clinic** | Branch management, cross-clinic data | Adds significant architectural complexity |
| **Telemedicine** | Video consultations, screen sharing | Requires WebRTC, too complex for hackathon |
| **Lab Integration** | Lab order management, result import | Requires external system integration |
| **Pharmacy** | Inventory management, stock tracking | Separate domain, not core to clinic flow |
| **Mobile App** | iOS/Android native app | Web responsive is sufficient for MVP |
| **EMR Integration** | HL7/FHIR integration with other systems | Enterprise feature, not hackathon-appropriate |
| **Online Payments** | Payment gateway (Stripe, etc.) | Requires merchant account + PCI compliance |
| **AI Features** | AI-assisted diagnosis, symptom checker | Research-grade feature, not viable in 5 days |
| **Advanced Security** | 2FA, SSO, session management | Important but not needed for demo |
| **Localization** | Beyond AR/EN (e.g., French, Urdu) | Two languages sufficient for MVP |
| **Offline Support** | PWA offline mode, sync | Complex data sync, not needed for demo |
