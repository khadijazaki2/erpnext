frappe.pages['accounts-dashboard'].on_page_load = function(wrapper) {

	frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Accounts Dashboard'),
	});

	let acc = new AccountsDashboard(wrapper);
	$(wrapper).bind('show', ()=> {
		acc.show();
	});
};

class AccountsDashboard {

	constructor(wrapper) {
		this.wrapper = $(wrapper);
		this.page = wrapper.page;
		this.main_section = this.wrapper.find('.layout-main-section');
		$('[data-toggle="tooltip"]').tooltip();
	}

	show() {
		this.main_section.empty().append(frappe.render_template('accounts_dashboard'));
		this.bank_balances = this.main_section.find('.bank-balances');
		this.sales_doughnut = this.main_section.find('.sales-doughnut');
		this.purchase_doughnut = this.main_section.find('.purchase-doughnut');
		this.invoice_filter = 'Last Year'
		this.render_bank_balances();
		this.get_sales_invoices();
		this.get_purchase_invoices();
		this.create_invoice_filters();
		this.render_profit_loss();
		this.render_cash_flow();
		this.render_sales();
	}

	get_sales() {
		frappe.xcall('erpnext.accounts.page.accounts_dashboard.accounts_dashboard.get', {
			chart: this.s_filters
		}).then(chart => {
			this.sales_chart.update(chart)
		});
	}

	render_sales() {
		this.s_filters = {
			'timespan': 'Last Year',
			'time_interval': 'Monthly',
		}
		this.sales_chart = new frappe.Chart('.sales-chart', {
			type: 'bar', //customizable
			height: 300,
			colors: ['#4f1ebb'],
			data: {
				labels: [],
	  
			datasets: [
			  {
				name: 'Sales',
				values: []
			  }
			]
			},
			tooltipOptions: {
						formatTooltipX: d => d,
						formatTooltipY: d => frappe.format(d, {
							fieldtype: "Currency",
						})
					}
		});
		this.get_sales();
		this.create_sales_chart_filters();
	}

	create_sales_chart_filters(){
		let filters = [
			{
				label: 'Last Year',
				options: ['Last Year', 'Last Quarter', 'Last Month'],
				action: (selected_item) => {
					this.s_filters.timespan = selected_item;
					this.get_sales();
				}
			},
			{
				label: 'Monthly',
				options: ['Yearly', 'Half-Yearly', 'Quarterly', 'Monthly'],
				action: (selected_item) => {
					this.s_filters.time_interval = selected_item;
					this.get_sales();
				}
			},
		];
		this.render_chart_filters(filters, '.sales-chart-container', 1);
	}

	render_bank_balances() {
		frappe.xcall('erpnext.accounts.page.accounts_dashboard.accounts_dashboard.get_bank_balances', {
		}).then((r) => {
			this.bank_balances.empty().append(frappe.render_template('bank_balances', {
				abc: r.balances,
				currency: r.currency
			}));
		});
	}

	get_fiscal_years(){
		return frappe.call({
		  method: 'erpnext.accounts.page.accounts_dashboard.accounts_dashboard.get_fiscal_years',
		  async: false,
		  callback: r => {
			this.fiscals = r.message
		  },
		});
}

	render_profit_loss() {
		this.fiscal = frappe.defaults.get_user_default("fiscal_year")
		this.pl_filters = {
			'company': frappe.defaults.get_user_default("company"),
			'to_fiscal_year': this.fiscal,
			'from_fiscal_year': this.fiscal,
			'periodicity': 'Quarterly'
		};
		this.pl_customs = {
			type: 'line',
			isNavigable: 1, 
			valuesOverPoints: 1,
			regionFill: 1,
			hideDots: 0,
			hideLine: 0,
			heatline: 0,
			stacked: 0
		}
		this.make_pl_chart();
		// this.update_pl_chart_data();
		this.create_pl_chart_filters();
		this.create_pl_chart_customs();
	}

	make_pl_chart(){
		this.pl_chart = new frappe.Chart('.pl-chart', {
			type: this.pl_customs.type, //customizable
			height: 300,
			colors: ['#0e6333', '#ff5858', '#4f1ebb'],
			isNavigable: this.pl_customs.isNavigable, //customizable
			valuesOverPoints: this.pl_customs.valuesOverPoints, //customizable
			lineOptions: {
				regionFill: this.pl_customs.regionFill, //customizable
				hideDots: this.pl_customs.hideDots, //customizable
				hideLine: this.pl_customs.hideLine, //customizable
				heatline: this.pl_customs.heatline //customizable
			},
			barOptions: {
				stacked: this.pl_customs.stacked, //customizable
			},
			data: {
				labels: [],
	  
			datasets: [
			  {
				name: 'Income',
				values: []
			  },
			  {
				name: 'Expenses',
				values: []
			  },
			  {
				name: 'Net Profit/Loss',
				values: []
			  }
			],
			},
			tooltipOptions: {
						formatTooltipX: d => d,
						formatTooltipY: d => frappe.format(d, {
							fieldtype: "Currency",
						})
					}
		});
		this.update_pl_chart_data();
	}


	update_pl_chart_data() {
		frappe.xcall('erpnext.accounts.report.profit_and_loss_statement.profit_and_loss_statement.execute', {
			filters: this.pl_filters,
			dashboard: true,
		}).then(chart => {
			this.pl_chart.update(chart.data);
		});
	}

	create_pl_chart_filters() {
		this.fiscals = []
		this.get_fiscal_years();
		let filters = [
			{
				label: 'line',
				options: ['line', 'bar'],
				action: (selected_item) => {
					this.pl_customs.type = selected_item
					this.make_pl_chart();
				}
			},
			{
				label: 'Quarterly',
				options: ['Yearly', 'Half-Yearly', 'Quarterly', 'Monthly'],
				action: (selected_item) => {
					this.pl_filters.periodicity = selected_item;
					this.update_pl_chart_data();
				}
			},
			{
				label: this.fiscal,
				title: "From Fiscal Year",
				options: this.fiscals,
				action: (selected_item) => {
					this.pl_filters.from_fiscal_year = selected_item;
					this.update_pl_chart_data();
				}
			},
			{
				label: this.fiscal,
				title: "To Fiscal Year",
				options: this.fiscals,
				action: (selected_item) => {
					this.pl_filters.to_fiscal_year = selected_item;
					this.update_pl_chart_data();
				}
			},
		];
		this.render_chart_filters(filters, '.pl-chart-container', 1, 'pl_chart');
	}

	render_cash_flow() {
		this.fiscal = frappe.defaults.get_user_default("fiscal_year")
		this.cf_filters = {
			'company': frappe.defaults.get_user_default("company"),
			'to_fiscal_year': this.fiscal,
			'from_fiscal_year': this.fiscal,
			'periodicity': 'Yearly'
		};
		this.cf_customs = {
			type: 'bar',
			isNavigable: 0, 
			valuesOverPoints: 1,
			regionFill: 1,
			hideDots: 0,
			hideLine: 0,
			heatline: 0,
			stacked: 0
		}
		this.make_cf_chart();
		this.create_cf_chart_filters();
		this.create_cf_chart_customs();
	}


	make_cf_chart(){
		this.cf_chart = new frappe.Chart('.cf-chart', {
			type: this.cf_customs.type, //customizable
			height: 200,
			colors: ['#0e6333', '#ff5858', '#4f1ebb'],
			isNavigable: this.cf_customs.isNavigable, //customizable
			valuesOverPoints: this.cf_customs.valuesOverPoints, //customizable
			lineOptions: {
				regionFill: this.cf_customs.regionFill, //customizable
				hideDots: this.cf_customs.hideDots, //customizable
				hideLine: this.cf_customs.hideLine, //customizable
				heatline: this.cf_customs.heatline //customizable
			},
			barOptions: {
				stacked: this.cf_customs.stacked, //customizable
			},
			data: {
				labels: [],
	  
				datasets: [
					{
					  name: 'Net Cash from Operations',
					  values: []
					},
					{
					  name: 'Net Cash from Investing',
					  values: []
					},
					{
					  name: 'Net Cash from Financing',
					  values: []
					},
				  ],
			},
			tooltipOptions: {
						formatTooltipX: d => d,
						formatTooltipY: d => frappe.format(d, {
							fieldtype: "Currency",
						})
					}
		});
		this.update_cf_chart_data();
	}

	update_cf_chart_data() {
		frappe.xcall('erpnext.accounts.report.cash_flow.cash_flow.execute', {
			filters: this.cf_filters,
			dashboard: true,
		}).then(chart => {
			this.cf_chart.update(chart.data);
		});
	}

	create_cf_chart_filters() {
		this.fiscals = []
		this.get_fiscal_years();
		let filters = [
			{
				label: 'bar',
				options: ['bar', 'line'],
				action: (selected_item) => {
					this.cf_customs.type = selected_item
					this.make_cf_chart();
				}
			},
			{
				label: 'Yearly',
				options: ['Yearly', 'Half-Yearly', 'Quarterly', 'Monthly'],
				action: (selected_item) => {
					this.cf_filters.periodicity = selected_item;
					this.update_cf_chart_data();
				}
			},
			{
				label: this.fiscal,
				title: "From Fiscal Year",
				options: this.fiscals,
				action: (selected_item) => {
					this.cf_filters.from_fiscal_year = selected_item;
					this.update_cf_chart_data();
				}
			},
			{
				label: this.fiscal,
				title: "To Fiscal Year",
				options: this.fiscals,
				action: (selected_item) => {
					this.cf_filters.to_fiscal_year = selected_item;
					this.update_cf_chart_data();
				}
			},
		];
		this.render_chart_filters(filters, '.cf-chart-container', 1, 'cf_chart');
	}

	render_chart_filters(filters, container, append, chart_name) {
		let export_btn = `<button class="btn btn-default btn-xs">
		<span class="filter-label">Export Chart</span>
	</button>`;
		let $export_chart = $(export_btn);
		if(chart_name == 'pl_chart'){
		$export_chart.appendTo(this.wrapper.find(container));
		$export_chart.on('click', (e) => {
				this.pl_chart.export();
			});
	}
	else if(chart_name == 'cf_chart'){
		$export_chart.appendTo(this.wrapper.find(container));
		$export_chart.on('click', (e) => {
				this.cf_chart.export();
			});
	}
		filters.forEach(filter => {
			let chart_filter_html = `<div class="chart-filter pull-right">
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
				$el.parents('.chart-filter').find('.filter-label').text(selected_item);
				filter.action(selected_item, fieldname);
			});
		});

	}

	create_cf_chart_customs() {
		let customs = [
			{
				label: 'Navigable',
				value: this.cf_customs.isNavigable,
				action: (selected_item) => {
					this.cf_customs.isNavigable = selected_item;
					this.make_cf_chart();
				}
			},
			{
				label: 'Values over points',
				value: this.cf_customs.valuesOverPoints,
				action: (selected_item) => {
					this.cf_customs.valuesOverPoints = selected_item;
					this.make_cf_chart();
				}
			},
			{
				label: 'Fill region',
				value: this.cf_customs.regionFill,
				action: (selected_item) => {
					this.cf_customs.regionFill = selected_item;
					this.make_cf_chart();
				}
			},
			{
				label: 'Hide Dots',
				value: this.cf_customs.hideDots,
				action: (selected_item) => {
					this.cf_customs.hideDots = selected_item;
					this.make_cf_chart();
				}
			},
			{
				label: 'Hide Line',
				value: this.cf_customs.hideLine,
				action: (selected_item) => {
					this.cf_customs.hideLine = selected_item;
					this.make_cf_chart();
				}
			},
			{
				label: 'Heatline',
				value: this.cf_customs.heatline,
				action: (selected_item) => {
					this.cf_customs.heatline = selected_item;
					this.make_cf_chart();
				}
			},
			{
				label: 'Stacked',
				value: this.cf_customs.stacked,
				action: (selected_item) => {
					this.cf_customs.stacked = selected_item;
					this.make_cf_chart();
				}
			},
		];
		this.render_chart_customs(customs, '.cf-chart-container', 1);
	}

	create_pl_chart_customs() {
		let customs = [
			{
				label: 'Navigable',
				value: this.pl_customs.isNavigable,
				action: (selected_item) => {
					this.pl_customs.isNavigable = selected_item;
					this.make_pl_chart();
				}
			},
			{
				label: 'Values over points',
				value: this.pl_customs.valuesOverPoints,
				action: (selected_item) => {
					this.pl_customs.valuesOverPoints = selected_item;
					this.make_pl_chart();
				}
			},
			{
				label: 'Fill region',
				value: this.pl_customs.regionFill,
				action: (selected_item) => {
					this.pl_customs.regionFill = selected_item;
					this.make_pl_chart();
				}
			},
			{
				label: 'Hide Dots',
				value: this.pl_customs.hideDots,
				action: (selected_item) => {
					this.pl_customs.hideDots = selected_item;
					this.make_pl_chart();
				}
			},
			{
				label: 'Hide Line',
				value: this.pl_customs.hideLine,
				action: (selected_item) => {
					this.pl_customs.hideLine = selected_item;
					this.make_pl_chart();
				}
			},
			{
				label: 'Heatline',
				value: this.pl_customs.heatline,
				action: (selected_item) => {
					this.pl_customs.heatline = selected_item;
					this.make_pl_chart();
				}
			},
			{
				label: 'Stacked',
				value: this.pl_customs.stacked,
				action: (selected_item) => {
					this.pl_customs.stacked = selected_item;
					this.make_pl_chart();
				}
			},
		];
		this.render_chart_customs(customs, '.pl-chart-container', 1);
	}

	render_chart_customs(filters, container, append) {
		filters.forEach(filter => {
			let chart_filter_html = `<div class="checkbox inline-checkboxes">
			<label><input type="checkbox">${filter.label}</label>
		  </div>`;
			let $chart_filter = $(chart_filter_html);
			  $chart_filter.find('input[type="checkbox"]').prop('checked', filter.value);
			  $chart_filter.appendTo(this.wrapper.find(container));
			$chart_filter.find("input[type='checkbox']").on('change', (e) => {
				let $el = $(e.currentTarget);
				let fieldname;
				if ($el.attr('data-fieldname')) {
					fieldname = $el.attr('data-fieldname');
				}
				let selected_item = $el[0].checked;
				filter.action(selected_item, fieldname);
			});
		});

	}

	create_sales_invoice_chart(data) {
var ctx = document.getElementById('myChart').getContext('2d');
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

	create_purchase_invoice_chart(data) {
var ctx = document.getElementById('purchaseI').getContext('2d');
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

	get_sales_invoices() {
		frappe.xcall('erpnext.accounts.page.accounts_dashboard.accounts_dashboard.get_invoices', {
			invoice_type: 'Sales Invoice',
			timespan: this.invoice_filter,
			company: frappe.defaults.get_user_default("company")
		}).then(r => {
			this.sales_doughnut.empty().append(frappe.render_template('sales', {
				type: 'Sales',
				paid_total: r.paid_total,
				unpaid_total: r.unpaid_total,
				overdue_total: r.overdue_total,
				currency: r.currency
			}));
			this.create_sales_invoice_chart(r.data);
		});
	}

	get_purchase_invoices() {
		frappe.xcall('erpnext.accounts.page.accounts_dashboard.accounts_dashboard.get_invoices', {
			invoice_type: 'Purchase Invoice',
			timespan: this.invoice_filter,
			company: frappe.defaults.get_user_default("company")
		}).then(r => {
			this.purchase_doughnut.empty().append(frappe.render_template('purchase', {
				type: 'Purchases',
				paid_total: r.paid_total,
				unpaid_total: r.unpaid_total,
				overdue_total: r.overdue_total,
				currency: r.currency
			}));
			this.create_purchase_invoice_chart(r.data);
		});
	}

	create_invoice_filters() {
		let filters = [
			{
				label: 'Last Year',
				options: ['Last Year', 'Last Month', 'Last Quarter', 'Last Week'],
				action: (selected_item) => {
					this.invoice_filter = selected_item;
					this.get_sales_invoices();
					this.get_purchase_invoices();
				}
			}
		];
		this.render_invoice_filters(filters, '.invoice-chart-container', 1, 'none');
	}

	render_invoice_filters(filters, container, append, chart_name) {
		filters.forEach(filter => {
			let chart_filter_html = `<div class="chart-filter">
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
				$el.parents('.chart-filter').find('.filter-label').text(selected_item);
				filter.action(selected_item, fieldname);
			});
		});

	}
}
