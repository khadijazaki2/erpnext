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
		this.appraisal = this.main_section.find('.appraisal');
		this.get_appraisal();
		this.attendance_doughnut = this.main_section.find('.attendance');
		this.pending_values = this.main_section.find('.pending');
		this.get_attendance();
		this.get_pendings();
		if (frappe.user.has_role('Administrator') || frappe.user.has_role('System Manager') || frappe.user.has_role('HR Manager') || frappe.user.has_role('HR User')){
			this.dept = this.main_section.find('.dept-analytics');
			this.get_dept();
		this.opening = this.main_section.find('.opening');
		this.offer = this.main_section.find('.offer');
		this.application = this.main_section.find('.application');
		this.opening_filter = this.offer_filter = this.app_filter = 'Last Month';
		this.get_openings();
		this.get_offers();
		this.get_applications();
		}
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

	get_appraisal(){
		frappe.xcall('erpnext.hr.page.hr_dashboard.hr_dashboard.get_appraisal', {
			dashboard: true
		}).then(chart => {
			this.appraisal.empty().append(frappe.render_template('appraisal', {
				completed: chart.completed,
				pending: chart.pending
			}));
			this.make_app_chart(chart.data);
		});
	}

	make_app_chart(data){
		this.test_chart = new frappe.Chart('.appraisal-chart', {
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
				responsive: false,
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


	get_openings() {
		frappe.xcall('erpnext.hr.page.hr_dashboard.hr_dashboard.get_job_openings', {
			timespan: this.opening_filter,
		}).then(r => {
			this.opening.empty().append(frappe.render_template('opening', {
				opened: r.open,
				closed: r.closed,
				total: r.total
			}));
			this.create_recruit_chart(r.data, 'openChart');
			this.create_open_filters();
		});
	}

	get_offers() {
		frappe.xcall('erpnext.hr.page.hr_dashboard.hr_dashboard.get_job_offers', {
			timespan: this.offer_filter,
		}).then(r => {
			this.offer.empty().append(frappe.render_template('offers', {
				awaiting: r.awaiting,
				accepted: r.accepted,
				rejected: r.rejected,
				total: r.total
			}));
			this.create_recruit_chart(r.data, 'offerChart');
			this.create_offer_filters();
		});
	}


	get_applications() {
		frappe.xcall('erpnext.hr.page.hr_dashboard.hr_dashboard.get_job_apps', {
			timespan: this.offer_filter,
		}).then(r => {
			this.application.empty().append(frappe.render_template('applications', {
				open: r.open,
				replied: r.replied,
				hold: r.hold,
				accepted: r.accepted,
				rejected: r.rejected,
				total: r.total
			}));
			this.create_recruit_chart(r.data, 'appChart');
			this.create_app_filters();
		});
	}

	create_recruit_chart(data, chart_id) {
		var ctx = document.getElementById(chart_id).getContext('2d');
		var myChart = new Chart(ctx, {
			type: 'doughnut',
			data: data,
			options: {
				cutoutPercentage: 70,
				responsive: false,
				legend: {
					display: false
				},
			}
		});
	}

	create_open_filters() {
		let filters = [
			{
				label: this.opening_filter,
				options: ['Last Year', 'Last Month', 'Last Quarter', 'Last Week'],
				action: (selected_item) => {
					this.opening_filter = selected_item;
					this.get_openings();
				}
			}
		];
		this.render_recruit_filters(filters, '.open-chart-container', 1, 'none');
	}


	create_offer_filters() {
		let filters = [
			{
				label: this.offer_filter,
				options: ['Last Year', 'Last Month', 'Last Quarter', 'Last Week'],
				action: (selected_item) => {
					this.offer_filter = selected_item;
					this.get_offers();
				}
			}
		];
		this.render_recruit_filters(filters, '.offer-chart-container', 1, 'none');
	}


	create_app_filters() {
		let filters = [
			{
				label: this.app_filter,
				options: ['Last Year', 'Last Month', 'Last Quarter', 'Last Week'],
				action: (selected_item) => {
					this.app_filter = selected_item;
					this.get_applications();
				}
			}
		];
		this.render_recruit_filters(filters, '.app-chart-container', 1, 'none');
	}

	render_recruit_filters(filters, container, append, chart_name) {
		filters.forEach(filter => {
			let chart_filter_html = `<div class="chart-filter2 pull-right">
			<a class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					<button class="btn btn-default btn-xs" data-toggle="tooltip" data-placement="top" title="${filter.title}">
						<span class="filter-label">${filter.label}</span>
						<span class="caret"></span>
					</button>
				</a>`;
			let options_html;

			if (filter.fieldnames) {
				options_html = filter.options.map((option, i) =>
					`<li><a data-fieldname = "${filter.fieldnames[i]}">${option}</a></li>`).join('');
			} else {
				options_html = filter.options.map( option => `<li><a>${option}</a></li>`).join('');
			}

			let dropdown_html = chart_filter_html + `<ul class="dropdown-menu">${options_html}</ul></div>`;
			let $chart_filter = $(dropdown_html);

			if (append) {
				$chart_filter.prependTo(this.wrapper.find(container));
			} else $chart_filter.appendTo(this.wrapper.find(container));

			$chart_filter.find('.dropdown-menu').on('click', 'li a', (e) => {
				let $el = $(e.currentTarget);
				let fieldname;
				if ($el.attr('data-fieldname')) {
					fieldname = $el.attr('data-fieldname');
				}
				let selected_item = $el.text();
				$el.parents('.chart-filter2').find('.filter-label').text(selected_item);
				filter.action(selected_item, fieldname);
			});
		});

	}
}
