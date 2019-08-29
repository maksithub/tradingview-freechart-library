import { AccountManagerColumn, OrderTableColumn, OrderStatusFilter } from '../../charting_library/broker-api';

export const ordersPageColumns: OrderTableColumn[] = [
	{
		label: 'Symbol',
		className: 'tv-data-table__cell--symbol-cell',
		formatter: 'symbol',
		property: 'symbol',
	},
	{
		label: 'Side',
		className: '',
		property: 'side',
		formatter: 'side',
	},
	{
		label: 'Type',
		className: '',
		property: 'type',
		formatter: 'type',
	},
	{
		label: 'Qty',
		className: 'tv-data-table__cell--right-align',
		property: 'qty',
		help: 'Size in lots',
	},
	{
		label: 'Limit Price',
		className: 'tv-data-table__cell--right-align',
		property: 'limitPrice',
		formatter: 'formatPrice',
	},
	{
		label: 'Stop Price',
		className: 'tv-data-table__cell--right-align',
		property: 'stopPrice',
		formatter: 'formatPrice',
	},
	{
		label: 'Last',
		className: 'tv-data-table__cell--right-align',
		property: 'last',
		formatter: 'formatPriceForexSup',
		highlightDiff: true,
	},
	{
		id: 'status', // this column is filtered out in statuses filter by id
		label: 'Status',
		className: '',
		property: 'status',
		formatter: 'status',
		supportedStatusFilters: [OrderStatusFilter.All],
	},
	{
		label: 'Order id',
		className: '',
		property: 'id',
	},
	{
		label: '',
		className: 'tv-data-table__cell--buttons-cell',
		formatter: 'orderSettings',
		notSortable: true,
		modificationProperty: 'status',
	},
];

export const positionsPageColumns: AccountManagerColumn[] = [
	{
		label: 'Symbol',
		className: 'tv-data-table__cell--symbol-cell',
		formatter: 'symbol',
		property: 'symbol',
	},
	{
		label: 'Side',
		className: '',
		property: 'side',
		formatter: 'side',
	},
	{
		label: 'Qty',
		className: 'tv-data-table__cell--right-align',
		property: 'qty',
		help: 'Size in lots',
	},
	{
		label: 'Avg Fill Price',
		className: 'tv-data-table__cell--right-align',
		property: 'avgPrice',
		formatter: 'formatPrice',
	},
	{
		label: 'Last',
		className: 'tv-data-table__cell--right-align',
		property: 'last',
		formatter: 'formatPriceForexSup',
		highlightDiff: true,
	},
	{
		label: 'Profit',
		className: 'tv-data-table__cell--right-align',
		property: 'pl',
		formatter: 'profit',
	},
	{
		label: '',
		className: 'tv-data-table__cell--buttons-cell',
		formatter: 'posSettings',
		notSortable: true,
		modificationProperty: 'status',
	},
];

export const accountSummaryColumns: AccountManagerColumn[] = [
	{
		label: '',
		notSortable: true,
		property: 'title',
		formatter: 'custom_uppercase',
	},
	{
		label: 'Balance',
		className: 'tv-data-table__cell--right-align',
		property: 'balance',
		formatter: 'fixed',
		fixedWidth: true,
	},
	{
		label: 'Open PL',
		className: 'tv-data-table__cell--right-align',
		property: 'pl',
		formatter: 'profit',
		notSortable: true,
		fixedWidth: true,
	},
	{
		label: 'Equity',
		className: 'tv-data-table__cell--right-align',
		property: 'equity',
		formatter: 'fixed',
		notSortable: true,
		fixedWidth: true,
	},
];
