/**
 * @module Make sure that you include Promise polyfill in your bundle to support old browsers
 * @see {@link https://caniuse.com/#search=Promise | Browsers with native Promise support}
 * @see {@link https://www.npmjs.com/package/promise-polyfill | Polyfill}
 */

import {
	AccountInfo,
	AccountManagerInfo,
	AccountManagerSummaryField,
	ActionMetaInfo,
	ConnectionStatus,
	DefaultContextMenuActionsParams,
	Execution,
	IBrokerConnectionAdapterHost,
	IBrokerWithoutRealtime,
	IDelegate,
	InstrumentInfo,
	ITradeContext,
	IWatchedValue,
	MenuSeparator,
	Order,
	OrderStatus,
	OrderType,
	Position,
	PreOrder,
	QuotesBase,
	Side,
	TableFormatterInputs,
	OrderTicketFocusControl,
} from '../../charting_library/broker-api';

import { IDatafeedQuotesApi, QuoteData } from '../../charting_library/datafeed-api';

import {
	accountSummaryColumns,
	ordersPageColumns,
	positionsPageColumns,
} from './columns';

interface SimpleMap<TValue> {
	[key: string]: TValue;
}

interface AccountManagerData {
	title: string;
	balance: number;
	equity: number;
	pl: number;
}

export class BrokerSample implements IBrokerWithoutRealtime {
	private readonly _host: IBrokerConnectionAdapterHost;

	private readonly _accountManagerData: AccountManagerData = { title: 'Trading Sample', balance: 10000000, equity: 10000000, pl: 0 };
	private readonly _amChangeDelegate: IDelegate<(values: AccountManagerData) => void>;
	private readonly _balanceValue: IWatchedValue<number>;
	private readonly _equityValue: IWatchedValue<number>;

	private readonly _positionById: SimpleMap<Position> = {};
	private readonly _positions: Position[] = [];

	private readonly _orderById: SimpleMap<Order> = {};
	private readonly _orders: Order[] = [];

	private readonly _executions: Execution[] = [];

	private readonly _quotesProvider: IDatafeedQuotesApi;

	private _idsCounter: number = 1;

	public constructor(host: IBrokerConnectionAdapterHost, quotesProvider: IDatafeedQuotesApi) {
		this._quotesProvider = quotesProvider;
		this._host = host;

		this._host.setButtonDropdownActions(this._buttonDropdownItems());

		this._host.floatingTradingPanelVisibility().subscribe(() => {
			this._host.setButtonDropdownActions(this._buttonDropdownItems());
		});

		this._amChangeDelegate = this._host.factory.createDelegate();
		this._balanceValue = this._host.factory.createWatchedValue(this._accountManagerData.balance);
		this._equityValue = this._host.factory.createWatchedValue(this._accountManagerData.equity);

		this._amChangeDelegate.subscribe(null, (values: AccountManagerData) => {
			this._balanceValue.setValue(values.balance);
			this._equityValue.setValue(values.equity);
		});
	}

	public connectionStatus(): ConnectionStatus {
		return ConnectionStatus.Connected;
	}

	public chartContextMenuActions(context: ITradeContext, options?: DefaultContextMenuActionsParams): Promise<ActionMetaInfo[]> {
		return this._host.defaultContextMenuActions(context);
	}

	public isTradable(symbol: string): Promise<boolean> {
		return Promise.resolve(true);
	}

	public placeOrder(preOrder: PreOrder, silently?: boolean): Promise<void> {
		const handler = (params: PreOrder) => {
			if (params.stopLoss || params.takeProfit || preOrder.duration) {
				console.log('Stop Loss, Take Profit and Duration are not implemented in this sample.');
			}

			this._host.activateBottomWidget();

			const order: Order = {
				id: `${this._idsCounter++}`,
				duration: params.duration, // duration is not used in this sample
				limitPrice: params.limitPrice,
				profit: 0,
				qty: params.qty,
				side: params.side || Side.Buy,
				status: OrderStatus.Working,
				stopPrice: params.stopPrice,
				symbol: params.symbol,
				type: params.type || OrderType.Market,
			};

			this._updateOrder(order);

			return Promise.resolve();
		};

		if (silently) {
			return handler(preOrder);
		} else {
			return this._host.showOrderDialog(preOrder, handler).catch(() => { });
		}
	}

	public modifyOrder(order: Order, silently?: boolean, focus?: OrderTicketFocusControl): Promise<void> {
		const handler = (params: Order) => {
			const originalOrder = this._orderById[params.id];
			if (originalOrder) {
				const modifiedOrder: Order = { ...originalOrder };
				modifiedOrder.qty = params.qty;
				modifiedOrder.stopPrice = params.stopPrice;
				modifiedOrder.limitPrice = params.limitPrice;
				this._updateOrder(modifiedOrder);
			}

			return Promise.resolve();
		};

		if (silently) {
			return handler(order);
		} else {
			return this._host.showOrderDialog(order, handler).catch(() => { });
		}
	}

	public closePosition(positionId: string, silently: boolean): Promise<void> {
		const position = this._positionById[positionId];

		const handler = () => {
			return this.placeOrder(
				{
					symbol: position.symbol,
					side: position.side === Side.Sell ? Side.Buy : Side.Sell,
					type: OrderType.Market,
					qty: position.qty,
				},
				true
			);
		};

		if (silently) {
			return handler();
		} else {
			return this._host.showClosePositionDialog(position.id, handler);
		}
	}

	public orders(): Promise<Order[]> {
		return Promise.resolve(this._orders.slice());
	}

	public positions(): Promise<Position[]> {
		return Promise.resolve(this._positions.slice());
	}

	public executions(symbol: string): Promise<Execution[]> {
		return Promise.resolve(this._executions
			.filter((data: Execution) => {
				return data.symbol === symbol;
			})
		);
	}

	public reversePosition(positionId: string, silently?: boolean): Promise<void> {
		const position = this._positionById[positionId];
		const handler = () => {
			return this.placeOrder(
				{
					symbol: position.symbol,
					side: position.side === Side.Sell ? Side.Buy : Side.Sell,
					type: OrderType.Market,
					qty: position.qty * 2,
				},
				true
			);
		};

		if (silently) {
			return handler();
		} else {
			return this._host.showReversePositionDialog(position, handler);
		}
	}

	public cancelOrder(orderId: string, silently: boolean): Promise<void> {
		const order = this._orderById[orderId];
		const handler = () => {
			order.status = OrderStatus.Canceled;
			this._updateOrder(order);
			return Promise.resolve();
		};

		if (silently) {
			return handler();
		} else {
			return this._host.showCancelOrderDialog(order.id, handler);
		}
	}

	public cancelOrders(symbol: string, side: Side | undefined, ordersIds: string[], silently: boolean): Promise<void> {
		const closeHandler = () => {
			return Promise.all(ordersIds.map((orderId: string) => {
				return this.cancelOrder(orderId, true);
			})).then(() => { });
		};

		if (silently) {
			return closeHandler();
		} else {
			return this._host.showCancelMultipleOrdersDialog(symbol, side, ordersIds.length, closeHandler);
		}
	}

	public accountManagerInfo(): AccountManagerInfo {
		const summaryProps: AccountManagerSummaryField[] = [
			{
				text: 'Balance',
				wValue: this._balanceValue,
				formatter: 'fixed', // default value
			},
			{
				text: 'Equity',
				wValue: this._equityValue,
				formatter: 'fixed', // default value
			},
		];

		return {
			accountTitle: 'Trading Sample',
			summary: summaryProps,
			customFormatters: [{
				name: 'custom_uppercase', // just an example
				format: (inputs: TableFormatterInputs) => String(inputs.value).toUpperCase(),
			}],
			orderColumns: ordersPageColumns,
			positionColumns: positionsPageColumns,
			pages: [
				{
					id: 'accountsummary',
					title: 'Account Summary',
					tables: [
						{
							id: 'accountsummary',
							columns: accountSummaryColumns,
							getData: () => {
								return Promise.resolve([this._accountManagerData]);
							},
							initialSorting: {
								columnId: 'balance',
								asc: false,
							},
							changeDelegate: this._amChangeDelegate,
						},
					],
				},
			],
			contextMenuActions: (contextMenuEvent: JQueryEventObject, activePageActions: ActionMetaInfo[]) => {
				return Promise.resolve(this._bottomContextMenuItems(activePageActions));
			},
		};
	}

	public symbolInfo(symbol: string): Promise<InstrumentInfo> {
		return this._host.symbolSnapshot(symbol).then((data: QuotesBase) => {
			const mintick = data.minmov / data.pricescale;
			const pipSize = mintick; // pip size can differ from minTick
			const accountCurrencyRate = 1; // account currency rate
			const pointValue = 1; // USD value of 1 point of price

			return {
				qty: {
					min: 1,
					max: Number.MAX_VALUE,
					step: 1,
				},
				pipValue: pipSize * pointValue * accountCurrencyRate || 1,
				pipSize: pipSize,
				minTick: mintick,
				description: data.description,
			};
		});
	}

	public accountInfo(): Promise<AccountInfo> {
		return Promise.resolve({
			id: 'Trading Sample',
			name: '',
			currency: 'USD',
		});
	}

	private _bottomContextMenuItems(activePageActions: ActionMetaInfo[]): ActionMetaInfo[] {
		const separator: MenuSeparator = { separator: true };

		if (activePageActions.length) {
			activePageActions.push(separator);
		}

		return activePageActions.concat([
			{
				text: 'Show Buy/Sell Panel',
				action: () => {
					this._host.floatingTradingPanelVisibility().setValue(!this._host.floatingTradingPanelVisibility().value());
				},
				checkable: true,
				checked: this._host.floatingTradingPanelVisibility().value(),
			},
			{
				text: 'Trading Properties...',
				action: () => {
					this._host.showTradingProperties();
				},
			},
		]);
	}

	private _buttonDropdownItems(): ActionMetaInfo[] {
		const defaultActions = this._host.defaultDropdownMenuActions({ showFloatingToolbar: true });
		return defaultActions.concat([
			{
				separator: true,
			},
			{
				text: 'Trading Properties...',
				action: () => {
					this._host.showTradingProperties();
				},
			},
		]);
	}

	private _createPositionForOrder(order: Order): void {
		const positionId = order.symbol;

		let position = this._positionById[positionId];
		const orderSide = order.side;
		const orderQty = order.qty;

		order.avgPrice = order.price;

		if (position) {
			const sign = order.side === position.side ? 1 : -1;
			if (sign > 0) {
				position.avgPrice = (position.qty * position.avgPrice + order.qty * order.price) / (position.qty + order.qty);
			} else {
				position.avgPrice = position.avgPrice;

				const amountToClose = Math.min(orderQty, position.qty);
				this._accountManagerData.balance += (order.price - position.avgPrice) * amountToClose * (position.side === Side.Sell ? -1 : 1);
			}

			position.qty = position.qty + order.qty * sign;
			if (position.qty < 0) {
				position.side = position.side === Side.Sell ? Side.Buy : Side.Sell;
				position.qty *= -1;
			}
		} else {
			position = {
				...order,
				id: positionId,
				avgPrice: order.price,
			};
		}

		const execution: Execution = {
			id: `${this._idsCounter++}`,
			brokerSymbol: order.brokerSymbol,
			price: order.price,
			qty: orderQty,
			side: orderSide,
			symbol: order.symbol,
			time: Date.now(),
		};

		this._executions.push(execution);
		this._host.executionUpdate(execution);

		this._updatePosition(position);
		this._recalculateAMData();
	}

	private _updateOrderLast(order: Order): void {
		this._host.orderPartialUpdate(order.id, { last: order.last });
	}

	private _updateOrder(order: Order): void {
		const executionChecks = {
			[Side.Sell]: {
				[OrderType.Market]: () => !!order.price,
				[OrderType.Limit]: () => order.limitPrice !== undefined && order.last >= order.limitPrice,
				[OrderType.Stop]: () => order.stopPrice !== undefined && order.last <= order.stopPrice,
				[OrderType.StopLimit]: () => false,
			},

			[Side.Buy]: {
				[OrderType.Market]: () => !!order.price,
				[OrderType.Limit]: () => order.limitPrice !== undefined && order.last <= order.limitPrice,
				[OrderType.Stop]: () => order.stopPrice !== undefined && order.last >= order.stopPrice,
				[OrderType.StopLimit]: () => false,
			},
		};

		const hasOrderAlready = Boolean(this._orderById[order.id]);
		this._orderById[order.id] = order;

		if (!hasOrderAlready) {
			this._orders.push(order);

			this._subscribeData(order.symbol, order.id, (last: number) => {
				if (order.last === last) {
					return;
				}

				order.last = last;
				if (order.price == null) {
					order.price = order.last;
				}

				if (order.status === OrderStatus.Working && executionChecks[order.side][order.type]()) {
					const positionData = { ...order };
					delete positionData.status;
					order.price = order.last;
					order.avgPrice = order.last;
					this._createPositionForOrder(positionData);

					order.status = OrderStatus.Filled;
					this._updateOrder(order);
				}

				this._updateOrderLast(order);
			});
		}

		this._host.orderUpdate(order);
	}

	private _updatePosition(position: Position): void {
		const hasPositionAlready = Boolean(this._positionById[position.id]);

		if (hasPositionAlready && !position.qty) {
			this._unsubscribeData(position.id);
			const index = this._positions.indexOf(position);
			if (index !== -1) {
				this._positions.splice(index, 1);
			}

			delete this._positionById[position.id];

			this._host.positionUpdate(position);
			return;
		}

		if (!hasPositionAlready) {
			this._positions.push(position);

			this._subscribeData(position.symbol, position.id, (last: number) => {
				if (position.last === last) {
					return;
				}

				position.last = last;
				position.profit = (position.last - position.price) * position.qty * (position.side === Side.Sell ? -1 : 1);
				this._host.plUpdate(position.symbol, position.profit);
				this._host.positionPartialUpdate(position.id, position);
				this._recalculateAMData();
			});
		}

		this._positionById[position.id] = position;

		this._host.positionUpdate(position);
	}

	private _subscribeData(symbol: string, id: string, updateFunction: (last: number) => void): void {
		this._quotesProvider.subscribeQuotes(
			[],
			[symbol],
			(symbols: QuoteData[]) => {
				const deltaData = symbols[0];
				if (deltaData.s !== 'ok') {
					return;
				}

				if (typeof deltaData.v.lp === 'number') {
					updateFunction(deltaData.v.lp);
				}
			},
			getDatafeedSubscriptionId(id)
		);
	}

	private _unsubscribeData(id: string): void {
		this._quotesProvider.unsubscribeQuotes(getDatafeedSubscriptionId(id));
	}

	private _recalculateAMData(): void {
		let pl = 0;
		this._positions.forEach((position: Position) => {
			pl += position.profit || 0;
		});

		this._accountManagerData.pl = pl;
		this._accountManagerData.equity = this._accountManagerData.balance + pl;

		this._amChangeDelegate.fire(this._accountManagerData);
	}
}

function getDatafeedSubscriptionId(id: string): string {
	return `SampleBroker-${id}`;
}
