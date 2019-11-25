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
		this.get_dept();
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
			type: 'bar', //customizable
			height: 200,
			colors: ['#4f1ebb'],
			valuesOverPoints: 1, //customizable
			data: data,
			tooltipOptions: {
						formatTooltipX: d => d,
						formatTooltipY: d => d
					}
		});
	}

}
