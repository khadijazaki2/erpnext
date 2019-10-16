from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Student"),
			"items": [
				{
					"type": "doctype",
					"name": "Student",
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Guardian"
				},
				{
					"type": "doctype",
					"name": "Student Log"
				},
				{
					"type": "doctype",
					"name": "Student Group"
				}
			],
			"icon": "/assets/frappe/images/icons/student_icon.png"
		},
		{
			"label": _("Admission"),
			"items": [

				{
					"type": "doctype",
					"name": "Student Applicant"
				},
				{
					"type": "doctype",
					"name": "Web Academy Applicant"
				},
				{
					"type": "doctype",
					"name": "Student Admission"
				},
				{
					"type": "doctype",
					"name": "Program Enrollment"
				}
			],
			"icon": "/assets/frappe/images/icons/admission.png"
		},
		{
			"label": _("Attendance"),
			"items": [
				{
					"type": "doctype",
					"name": "Student Attendance"
				},
				{
					"type": "doctype",
					"name": "Student Leave Application"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Absent Student Report",
					"doctype": "Student Attendance"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Student Batch-Wise Attendance",
					"doctype": "Student Attendance"
				},
			],
			"icon": "/assets/frappe/images/icons/attendance_icon.png"
		},
		{
			"label": _("Tools"),
			"items": [
				{
					"type": "doctype",
					"name": "Student Attendance Tool"
				},
				{
					"type": "doctype",
					"name": "Assessment Result Tool"
				},
				{
					"type": "doctype",
					"name": "Student Group Creation Tool"
				},
				{
					"type": "doctype",
					"name": "Program Enrollment Tool"
				},
				{
					"type": "doctype",
					"name": "Course Scheduling Tool"
				}
			],
			"icon": "/assets/frappe/images/icons/tools_icon.png"
		},
		{
			"label": _("Assessment"),
			"items": [
				{
					"type": "doctype",
					"name": "Assessment Plan"
				},
				{
					"type": "doctype",
					"name": "Assessment Group",
					"link": "Tree/Assessment Group",
				},
				{
					"type": "doctype",
					"name": "Assessment Result"
				},
				{
					"type": "doctype",
					"name": "Assessment Criteria"
				}
			],
			"icon": "/assets/frappe/images/icons/assessment.png"
		},
		{
			"label": _("Assessment Reports"),
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "Course wise Assessment Report",
					"doctype": "Assessment Result"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Final Assessment Grades",
					"doctype": "Assessment Result"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Assessment Plan Status",
					"doctype": "Assessment Plan"
				},
				{
					"type": "doctype",
					"name": "Student Report Generation Tool"
				}
			],
			"icon": "/assets/frappe/images/icons/assessment_reports.png"
		},
		{
			"label": _("Fees"),
			"items": [
				{
					"type": "doctype",
					"name": "Fees"
				},
				{
					"type": "doctype",
					"name": "Fee Schedule"
				},
				{
					"type": "doctype",
					"name": "Fee Structure"
				},
				{
					"type": "doctype",
					"name": "Fee Category"
				}
			],
			"icon": "/assets/frappe/images/icons/Fees.png"
		},
		{
			"label": _("Schedule"),
			"items": [
				{
					"type": "doctype",
					"name": "Course Schedule",
					"route": "#List/Course Schedule/Calendar"
				},
				{
					"type": "doctype",
					"name": "Course Scheduling Tool"
				}
			],
			"icon": "/assets/frappe/images/icons/schedule_icon.png"
		},
		{
			"label": _("Masters"),
			"items": [
				{
					"type": "doctype",
					"name": "Program",
				},
				{
					"type": "doctype",
					"name": "Course",
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Topic",
				},
				{
					"type": "doctype",
					"name": "Instructor",
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Room",
					"onboard": 1,
				}
			],
			"icon": "/assets/frappe/images/icons/masters_icon.png"
		},
		{
			"label": _("Content Masters"),
			"items": [
				{
					"type": "doctype",
					"name": "Article"
				},
				{
					"type": "doctype",
					"name": "Video"
				},
				{
					"type": "doctype",
					"name": "Quiz"
				}
			],
			"icon": "/assets/frappe/images/icons/content_masters.png"
		},
		{
			"label": _("LMS Activity"),
			"items": [
				{
					"type": "doctype",
					"name": "Course Enrollment"
				},
				{
					"type": "doctype",
					"name": "Course Activity"
				},
				{
					"type": "doctype",
					"name": "Quiz Activity"
				}
			],
			"icon": "/assets/frappe/images/icons/lms_activity.png"
		},
		{
			"label": _("Settings"),
			"items": [
				{
					"type": "doctype",
					"name": "Student Category"
				},
				{
					"type": "doctype",
					"name": "Student Batch Name"
				},
				{
					"type": "doctype",
					"name": "Grading Scale",
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Academic Term"
				},
				{
					"type": "doctype",
					"name": "Academic Year"
				},
				{
					"type": "doctype",
					"name": "Education Settings"
				}
			],
			"icon": "/assets/frappe/images/icons/settings_icon.png"
		},
		{
			"label": _("Other Reports"),
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "Student and Guardian Contact Details",
					"doctype": "Program Enrollment"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Student Monthly Attendance Sheet",
					"doctype": "Student Attendance"
				},
				{
					"type": "report",
					"name": "Student Fee Collection",
					"doctype": "Fees",
					"is_query_report": True
				}
			],
			"icon": "/assets/frappe/images/icons/reports_icon.png"
		}
	]
