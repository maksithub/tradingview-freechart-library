/**
 * @module Make sure that you include Promise polyfill in your bundle to support old browsers
 * @see {@link https://caniuse.com/#search=Promise | Browsers with native Promise support}
 * @see {@link https://www.npmjs.com/package/promise-polyfill | Polyfill}
 */
import * as tslib_1 from "tslib";
import { accountSummaryColumns, ordersPageColumns, positionsPageColumns, } from './columns';
var BrokerSample = /** @class */ (function () {
    function BrokerSample(host, quotesProvider) {
        var _this = this;
        this._accountManagerData = { title: 'Trading Sample', balance: 10000000, equity: 10000000, pl: 0 };
        this._positionById = {};
        this._positions = [];
        this._orderById = {};
        this._orders = [];
        this._executions = [];
        this._idsCounter = 1;
        this._quotesProvider = quotesProvider;
        this._host = host;
        this._host.setButtonDropdownActions(this._buttonDropdownItems());
        this._host.floatingTradingPanelVisibility().subscribe(function () {
            _this._host.setButtonDropdownActions(_this._buttonDropdownItems());
        });
        this._amChangeDelegate = this._host.factory.createDelegate();
        this._balanceValue = this._host.factory.createWatchedValue(this._accountManagerData.balance);
        this._equityValue = this._host.factory.createWatchedValue(this._accountManagerData.equity);
        this._amChangeDelegate.subscribe(null, function (values) {
            _this._balanceValue.setValue(values.balance);
            _this._equityValue.setValue(values.equity);
        });
    }
    BrokerSample.prototype.connectionStatus = function () {
        return 1 /* Connected */;
    };
    BrokerSample.prototype.chartContextMenuActions = function (context, options) {
        return this._host.defaultContextMenuActions(context);
    };
    BrokerSample.prototype.isTradable = function (symbol) {
        return Promise.resolve(true);
    };
    BrokerSample.prototype.placeOrder = function (preOrder, silently) {
        var _this = this;
        var handler = function (params) {
            if (params.stopLoss || params.takeProfit || preOrder.duration) {
                console.log('Stop Loss, Take Profit and Duration are not implemented in this sample.');
            }
            _this._host.activateBottomWidget();
            var order = {
                id: "" + _this._idsCounter++,
                duration: params.duration,
                limitPrice: params.limitPrice,
                profit: 0,
                qty: params.qty,
                side: params.side || 1 /* Buy */,
                status: 6 /* Working */,
                stopPrice: params.stopPrice,
                symbol: params.symbol,
                type: params.type || 2 /* Market */,
            };
            _this._updateOrder(order);
            return Promise.resolve();
        };
        if (silently) {
            return handler(preOrder);
        }
        else {
            return this._host.showOrderDialog(preOrder, handler).catch(function () { });
        }
    };
    BrokerSample.prototype.modifyOrder = function (order, silently, focus) {
        var _this = this;
        var handler = function (params) {
            var originalOrder = _this._orderById[params.id];
            if (originalOrder) {
                var modifiedOrder = tslib_1.__assign({}, originalOrder);
                modifiedOrder.qty = params.qty;
                modifiedOrder.stopPrice = params.stopPrice;
                modifiedOrder.limitPrice = params.limitPrice;
                _this._updateOrder(modifiedOrder);
            }
            return Promise.resolve();
        };
        if (silently) {
            return handler(order);
        }
        else {
            return this._host.showOrderDialog(order, handler).catch(function () { });
        }
    };
    BrokerSample.prototype.closePosition = function (positionId, silently) {
        var _this = this;
        var position = this._positionById[positionId];
        var handler = function () {
            return _this.placeOrder({
                symbol: position.symbol,
                side: position.side === -1 /* Sell */ ? 1 /* Buy */ : -1 /* Sell */,
                type: 2 /* Market */,
                qty: position.qty,
            }, true);
        };
        if (silently) {
            return handler();
        }
        else {
            return this._host.showClosePositionDialog(position.id, handler);
        }
    };
    BrokerSample.prototype.orders = function () {
        return Promise.resolve(this._orders.slice());
    };
    BrokerSample.prototype.positions = function () {
        return Promise.resolve(this._positions.slice());
    };
    BrokerSample.prototype.executions = function (symbol) {
        return Promise.resolve(this._executions
            .filter(function (data) {
            return data.symbol === symbol;
        }));
    };
    BrokerSample.prototype.reversePosition = function (positionId, silently) {
        var _this = this;
        var position = this._positionById[positionId];
        var handler = function () {
            return _this.placeOrder({
                symbol: position.symbol,
                side: position.side === -1 /* Sell */ ? 1 /* Buy */ : -1 /* Sell */,
                type: 2 /* Market */,
                qty: position.qty * 2,
            }, true);
        };
        if (silently) {
            return handler();
        }
        else {
            return this._host.showReversePositionDialog(position, handler);
        }
    };
    BrokerSample.prototype.cancelOrder = function (orderId, silently) {
        var _this = this;
        var order = this._orderById[orderId];
        var handler = function () {
            order.status = 1 /* Canceled */;
            _this._updateOrder(order);
            return Promise.resolve();
        };
        if (silently) {
            return handler();
        }
        else {
            return this._host.showCancelOrderDialog(order.id, handler);
        }
    };
    BrokerSample.prototype.cancelOrders = function (symbol, side, ordersIds, silently) {
        var _this = this;
        var closeHandler = function () {
            return Promise.all(ordersIds.map(function (orderId) {
                return _this.cancelOrder(orderId, true);
            })).then(function () { });
        };
        if (silently) {
            return closeHandler();
        }
        else {
            return this._host.showCancelMultipleOrdersDialog(symbol, side, ordersIds.length, closeHandler);
        }
    };
    BrokerSample.prototype.accountManagerInfo = function () {
        var _this = this;
        var summaryProps = [
            {
                text: 'Balance',
                wValue: this._balanceValue,
                formatter: 'fixed',
            },
            {
                text: 'Equity',
                wValue: this._equityValue,
                formatter: 'fixed',
            },
        ];
        return {
            accountTitle: 'Trading Sample',
            summary: summaryProps,
            customFormatters: [{
                    name: 'custom_uppercase',
                    format: function (inputs) { return String(inputs.value).toUpperCase(); },
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
                            getData: function () {
                                return Promise.resolve([_this._accountManagerData]);
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
            contextMenuActions: function (contextMenuEvent, activePageActions) {
                return Promise.resolve(_this._bottomContextMenuItems(activePageActions));
            },
        };
    };
    BrokerSample.prototype.symbolInfo = function (symbol) {
        return this._host.symbolSnapshot(symbol).then(function (data) {
            var mintick = data.minmov / data.pricescale;
            var pipSize = mintick; // pip size can differ from minTick
            var accountCurrencyRate = 1; // account currency rate
            var pointValue = 1; // USD value of 1 point of price
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
    };
    BrokerSample.prototype.accountInfo = function () {
        return Promise.resolve({
            id: 'Trading Sample',
            name: '',
            currency: 'USD',
        });
    };
    BrokerSample.prototype._bottomContextMenuItems = function (activePageActions) {
        var _this = this;
        var separator = { separator: true };
        if (activePageActions.length) {
            activePageActions.push(separator);
        }
        return activePageActions.concat([
            {
                text: 'Show Buy/Sell Panel',
                action: function () {
                    _this._host.floatingTradingPanelVisibility().setValue(!_this._host.floatingTradingPanelVisibility().value());
                },
                checkable: true,
                checked: this._host.floatingTradingPanelVisibility().value(),
            },
            {
                text: 'Trading Properties...',
                action: function () {
                    _this._host.showTradingProperties();
                },
            },
        ]);
    };
    BrokerSample.prototype._buttonDropdownItems = function () {
        var _this = this;
        var defaultActions = this._host.defaultDropdownMenuActions({ showFloatingToolbar: true });
        return defaultActions.concat([
            {
                separator: true,
            },
            {
                text: 'Trading Properties...',
                action: function () {
                    _this._host.showTradingProperties();
                },
            },
        ]);
    };
    BrokerSample.prototype._createPositionForOrder = function (order) {
        var positionId = order.symbol;
        var position = this._positionById[positionId];
        var orderSide = order.side;
        var orderQty = order.qty;
        order.avgPrice = order.price;
        if (position) {
            var sign = order.side === position.side ? 1 : -1;
            if (sign > 0) {
                position.avgPrice = (position.qty * position.avgPrice + order.qty * order.price) / (position.qty + order.qty);
            }
            else {
                position.avgPrice = position.avgPrice;
                var amountToClose = Math.min(orderQty, position.qty);
                this._accountManagerData.balance += (order.price - position.avgPrice) * amountToClose * (position.side === -1 /* Sell */ ? -1 : 1);
            }
            position.qty = position.qty + order.qty * sign;
            if (position.qty < 0) {
                position.side = position.side === -1 /* Sell */ ? 1 /* Buy */ : -1 /* Sell */;
                position.qty *= -1;
            }
        }
        else {
            position = tslib_1.__assign({}, order, { id: positionId, avgPrice: order.price });
        }
        var execution = {
            id: "" + this._idsCounter++,
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
    };
    BrokerSample.prototype._updateOrderLast = function (order) {
        this._host.orderPartialUpdate(order.id, { last: order.last });
    };
    BrokerSample.prototype._updateOrder = function (order) {
        var _this = this;
        var _a, _b, _c;
        var executionChecks = (_a = {},
            _a[-1 /* Sell */] = (_b = {},
                _b[2 /* Market */] = function () { return !!order.price; },
                _b[1 /* Limit */] = function () { return order.limitPrice !== undefined && order.last >= order.limitPrice; },
                _b[3 /* Stop */] = function () { return order.stopPrice !== undefined && order.last <= order.stopPrice; },
                _b[4 /* StopLimit */] = function () { return false; },
                _b),
            _a[1 /* Buy */] = (_c = {},
                _c[2 /* Market */] = function () { return !!order.price; },
                _c[1 /* Limit */] = function () { return order.limitPrice !== undefined && order.last <= order.limitPrice; },
                _c[3 /* Stop */] = function () { return order.stopPrice !== undefined && order.last >= order.stopPrice; },
                _c[4 /* StopLimit */] = function () { return false; },
                _c),
            _a);
        var hasOrderAlready = Boolean(this._orderById[order.id]);
        this._orderById[order.id] = order;
        if (!hasOrderAlready) {
            this._orders.push(order);
            this._subscribeData(order.symbol, order.id, function (last) {
                if (order.last === last) {
                    return;
                }
                order.last = last;
                if (order.price == null) {
                    order.price = order.last;
                }
                if (order.status === 6 /* Working */ && executionChecks[order.side][order.type]()) {
                    var positionData = tslib_1.__assign({}, order);
                    delete positionData.status;
                    order.price = order.last;
                    order.avgPrice = order.last;
                    _this._createPositionForOrder(positionData);
                    order.status = 2 /* Filled */;
                    _this._updateOrder(order);
                }
                _this._updateOrderLast(order);
            });
        }
        this._host.orderUpdate(order);
    };
    BrokerSample.prototype._updatePosition = function (position) {
        var _this = this;
        var hasPositionAlready = Boolean(this._positionById[position.id]);
        if (hasPositionAlready && !position.qty) {
            this._unsubscribeData(position.id);
            var index = this._positions.indexOf(position);
            if (index !== -1) {
                this._positions.splice(index, 1);
            }
            delete this._positionById[position.id];
            this._host.positionUpdate(position);
            return;
        }
        if (!hasPositionAlready) {
            this._positions.push(position);
            this._subscribeData(position.symbol, position.id, function (last) {
                if (position.last === last) {
                    return;
                }
                position.last = last;
                position.profit = (position.last - position.price) * position.qty * (position.side === -1 /* Sell */ ? -1 : 1);
                _this._host.plUpdate(position.symbol, position.profit);
                _this._host.positionPartialUpdate(position.id, position);
                _this._recalculateAMData();
            });
        }
        this._positionById[position.id] = position;
        this._host.positionUpdate(position);
    };
    BrokerSample.prototype._subscribeData = function (symbol, id, updateFunction) {
        this._quotesProvider.subscribeQuotes([], [symbol], function (symbols) {
            var deltaData = symbols[0];
            if (deltaData.s !== 'ok') {
                return;
            }
            if (typeof deltaData.v.lp === 'number') {
                updateFunction(deltaData.v.lp);
            }
        }, getDatafeedSubscriptionId(id));
    };
    BrokerSample.prototype._unsubscribeData = function (id) {
        this._quotesProvider.unsubscribeQuotes(getDatafeedSubscriptionId(id));
    };
    BrokerSample.prototype._recalculateAMData = function () {
        var pl = 0;
        this._positions.forEach(function (position) {
            pl += position.profit || 0;
        });
        this._accountManagerData.pl = pl;
        this._accountManagerData.equity = this._accountManagerData.balance + pl;
        this._amChangeDelegate.fire(this._accountManagerData);
    };
    return BrokerSample;
}());
export { BrokerSample };
function getDatafeedSubscriptionId(id) {
    return "SampleBroker-" + id;
}
