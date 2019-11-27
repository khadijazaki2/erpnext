frappe.pages['hr-dashboard'].on_page_load = function(wrapper) {

	frappe.ui.make_app_page({
		parent: wrapper,
		title: __('HR Dashboard'),
	});

	let acc = new HrDashboard(wrapper);
	$(wrapper).bind('show', ()=> {
		acc.show();
	});
};

class HrDashboard {

	constructor(wrapper) {
		this.wrapper = $(wrapper);
		this.page = wrapper.page;
		this.main_section = this.wrapper.find('.layout-main-section');
		$('[data-toggle="tooltip"]').tooltip();
	}

	show() {
		this.main_section.empty().append(frappe.render_template('hr_dashboard'));
		this.dept = this.main_section.find('.dept-analytics');
		this.attendance_doughnut = this.main_section.find('.attendance');
		this.pending_values = this.main_section.find('.pending');
		this.get_dept();
		this.get_attendance();
		this.get_pendings();
	}

	get_dept() {
		frappe.xcall('erpnext.hr.report.department_analytics.department_analytics.execute', {
			dashboard: true
		}).then(chart => {
			this.dept.empty().append(frappe.render_template('dept', {
				total: chart.total,
			}));
			this.make_dept_chart(chart.data)
		});
	}

	make_dept_chart(data){
		this.dept_chart = new frappe.Chart('.dept-chart', {
			type: 'bar',
			height: 200,
			colors: ['#4f1ebb'],
			valuesOverPoints: 1,
			data: data,
			tooltipOptions: {
						formatTooltipX: d => d,
						formatTooltipY: d => d
					}
		});
	}

	create_presence_chart(data) {
		var ctx = document.getElementById('presence').getContext('2d');
		var myChart = new Chart(ctx, {
			type: 'doughnut',
			data: data,
			options: {
				cutoutPercentage: 70,
				legend: {
					display: false
				},
			}
		});
	}
		
	get_attendance() {
		frappe.xcall('erpnext.hr.page.hr_dashboard.hr_dashboard.get_current_presence', {
		}).then(r => {
			this.attendance_doughnut.empty().append(frappe.render_template('presence', {
				absent: r.absent,
				present: r.present,
				leave: r.leave,
				half: r.half
			}));
			this.create_presence_chart(r.data);
		});
	}

	get_pendings() {
		frappe.xcall('erpnext.hr.page.hr_dashboard.hr_dashboard.get_pendings', {
		}).then(r => {
			this.pending_values.empty().append(frappe.render_template('pending', {
				att: r.pending_att,
				late: r.late_entry,
				early: r.early_exit,
				leave: r.leave_app
			}));
		});
	}
}
