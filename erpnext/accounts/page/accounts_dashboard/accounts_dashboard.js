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
		this.render_bank_balances();
		this.render_profit_loss();
		this.render_cash_flow();
		// this.render_balance_sheet();
	}

	render_bank_balances() {
		frappe.xcall('erpnext.accounts.page.accounts_dashboard.accounts_dashboard.get_bank_balances', {
		}).then((r) => {
			this.bank_balances.empty().append(frappe.render_template('bank_balances', {
				abc: r
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
			'from_fiscal_year': this.fiscal - 4,
			'periodicity': 'Yearly'
		};
		this.pl_customs = {
			type: 'line',
			isNavigable: 1, 
			valuesOverPoints: 1,
			regionFill: 1,
			hideDots: 0,
			hideLine: 0,
			heatline: 1,
			stacked: 0
		}
		this.make_pl_chart();
		// this.update_pl_chart_data();
		this.create_pl_chart_filters();
		this.create_pl_chart_customs();
	}

	make_pl_chart(){
		this.pl_chart = new frappe.Chart('.pl-chart', {
			title: 'Profit and Loss',
			type: this.pl_customs.type, //customizable
			height: 300,
			colors: ['#00a849', '#ff6515', '#627fb2'],
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
				label: 'Yearly',
				options: ['Yearly', 'Half-Yearly', 'Quarterly', 'Monthly'],
				action: (selected_item) => {
					this.pl_filters.periodicity = selected_item;
					this.update_pl_chart_data();
				}
			},
			{
				label: this.fiscal - 4,
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
			'from_fiscal_year': this.fiscal - 4,
			'periodicity': 'Yearly'
		};
		this.make_cf_chart({});
		this.create_cf_chart_filters();
	}


	make_cf_chart({type = 'bar', isNavigable = 0, valuesOverPoints = 0, regionFill = 0, hideDots = 0, hideLine = 0, heatline = 0, stacked = 0}){
		this.cf_chart = new frappe.Chart('.cf-chart', {
			title: 'Cash Flow',
			type: type, //customizable
			height: 300,
			colors: ['#00a849', '#ff6515', '#627fb2'],
			isNavigable: isNavigable, //customizable
			valuesOverPoints: valuesOverPoints, //customizable
			lineOptions: {
				regionFill: regionFill, //customizable
				hideDots: hideDots, //customizable
				hideLine: hideLine, //customizable
				heatline: heatline //customizable
			},
			barOptions: {
				stacked: stacked, //customizable
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
					this.make_cf_chart({type: selected_item});
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
				label: this.fiscal - 4,
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
		$export_chart.appendTo(this.wrapper.find(container));
		$export_chart.on('click', (e) => {
			if(chart_name == 'pl_chart'){
				this.pl_chart.export();
			}
			else if(chart_name == 'cf_chart'){
				this.cf_chart.export();
			}
		});
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

	create_pl_chart_customs() {
		console.log(this.pl_customs.isNavigable)
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
			let chart_filter_html = `<div class="checkbox">
			<label><input type="checkbox">${filter.label}</label>
		  </div>`;
			let $chart_filter = $(chart_filter_html);
			  $chart_filter.find('input[type="checkbox"]').prop('checked', filter.value);
			  $chart_filter.prependTo(this.wrapper.find(container));
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
}
