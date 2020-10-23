const code = ''
/* tslint:disable */
import React from 'react';
import moment from 'moment';
import lodash from 'lodash';
import RowSelectionTable from '../../component/common/rowSelectionTable';
import Datasource from '../../assets/javascript/Datasource';
import template from '../../component/common/template';
import Tool from '../../assets/javascript/Tool';
import { post } from '../../assets/javascript/axios';
import apiHost from '../../assets/javascript/config';

// import TabTable from '../../component/common/tabTable';
import { Tab, Balloon, Icon, Button } from '@icedesign/base';

const TabPane = Tab.TabPane;
const { TabPane: AltTabPane } = Tab;


const arrList = [
  { label: 'item1', value: 1 },
  { label: 'item2', value: 2 },
  { label: 'item3', value: 3 },
]

class PartnerBills extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      reloadTabel: true,
      a: a(),
      arrList1: [],
    };
    this.selectedFiledIds = [];
  }

  getQueryItem = () => [
    {
      label: 'Billing Type',
      key: 'billingTypeIndex',
      type: 'select',
      value: '',
      dataList: Datasource.billingType(),
      width: '200px',
    },
    {
      label: 'Billing Month',
      key: 'billingMonth',
      type: 'monthPicker',
      value: '',
      width: '200px',
      format: data => (data ? moment(data).format('YYYYMM') : ''),
    },
    {
      label: 'Partner ID',
      key: 'partnerId',
      type: 'input',
      value: '',
      width: '200px',
    },
    {
      label: 'Partner Name',
      key: 'partnerName',
      type: 'input',
      value: '',
      width: '200px',
    },
    {
      label: 'Approval Status',
      key: 'approvalStatusIndex',
      type: 'select',
      value: '',
      width: '200px',
      dataList: Datasource.partnerBillStatus(),
    },
    {
      label: 'Payment Status',
      key: 'paymentStatusIndex',
      type: 'select',
      value: '',
      width: '200px',
      dataList: Datasource.partnerPayBillStatus(),
    },

    {
      label: 'Overdue Day',
      key: 'overdueDay',
      type: 'input-range',
      value: '',
      width: '200px',
      needCampare: false,
      start: {
        key: 'overdueDaysLower',
        value: '',
        dateFormater: ['YYYY-MM-DD', 'HH:00:00'],
        showTime: true,
        getDataFormater: 'YYYY-MM-DD',
        disabledDate: (calendarDate, endDate) => Tool.disabledStartDateRange(calendarDate, endDate, 365),
      },
      end: {
        key: 'overdueDaysUpper',
        value: '',
        showTime: true,
        dateFormater: ['YYYY-MM-DD', 'HH:59:59'],
        getDataFormater: 'YYYY-MM-DD',
        disabledDate: (calendarDate, startDate) => Tool.disabledEndDateRange(calendarDate, startDate, 365),
      },
    },

    {
      label: 'Overdue Days',
      key: 'date',
      type: 'start-end-input',
      needCampare: true,
      start: {
        id: 'start',
        hasClear: true,
        placeholder: 'Please input overdueDaysLower',
        key: 'overdueDaysLower',
        value: '',
        width: '200px',
      },
      end: {
        id: 'end',
        hasClear: true,
        placeholder: 'Please input overdueDaysUpper',
        key: 'overdueDaysUpper',
        value: '',
        width: '200px',
      },
    },
  ]

  getMarketingQueryItem = () => [
    {
      label: 'Sales Order ID',
      key: 'salesOrderId',
      type: 'input',
      value: '',
      width: '150px',
    },
    {
      label: 'Reservation ID',
      key: 'reservationId',
      type: 'input',
      value: '',
      width: '150px',
    },
    {
      label: 'Reservation Name',
      key: 'reservationName',
      type: 'input',
      value: '',
      width: '150px',
    },
    {
      label: 'Partner Name',
      key: 'partnerName',
      type: 'input',
      value: '',
      width: '150px',
    },
    {
      label: 'Billed Status',
      key: 'billedStatus',
      type: 'select',
      value: '',
      width: '150px',
      dataList: Datasource.partnerBillStatus(),
    },
    {
      label: 'Payment Status',
      key: 'paymentStatus',
      type: 'select',
      value: '',
      width: '150px',
      dataList: Datasource.paymentStatus(),
    },
    {
      label: 'Credit Released',
      key: 'creditReleased',
      type: 'select',
      value: '',
      width: '150px',
      dataList: Datasource.partnerPayBillStatus(),
    },
  ]

  getBtnConfig = () => ({
    showQueryButton: true,
    showExportButton: true,
    queryButtonConfig: {
      text: 'Search',
    },
    exportTable: {
      url: '/exportPartnerBillingRecord.json',
      params: {},
    },
    otherButtonList: [
      {
        label: 'Approval',
        type: 'primary',
        onClick: () => this.batchOperateHandle(1),
        disabled: !this.props.userInfo.isAmsBillManager,
      },
      {
        label: 'Reject',
        type: 'primary',
        onClick: () => this.batchOperateHandle(2),
        disabled: !this.props.userInfo.isAmsBillManager,
      },
    ],
  })

  getMarketingBtnConfig = () => ({
    showQueryButton: true,
    queryButtonConfig: {
      text: 'Search',
    },
  })


  getTableConfig = () => (
    {
      tableId: 'PartnerBills',
      getTable: {
        url: '/partnerBillingRecord.json',
        params: {},
        getRowProps: record => ({
          disabled: record.paymentStatus === 'Paid',
        }),
      },
      exportTable: {
        url: 'barter/taskList.json',
        params: {},
      },
      multiplePageSelect: false,
    }
  )

  getSelectedFiled = (ids) => {
    this.selectedFiledIds = ids;
  }

  render() {
    return (
      <div className="partner-bill">
        <div className="arr">
          {arrList.map(item => <div key={item.value}>{item.label}</div>)}
        </div>

        <Tab>
          <TabPane key={1} tab={<span>Markrting Assets</span>}>
            <RowSelectionTable
              tableConfig={{
                tableId: 'MarketingAssets',
                getTable: {
                  url: '/reservationBillingRecord.json',
                  params: {},
                  getRowProps: record => ({
                    disabled: record.paymentStatus === 'Paid',
                  }),
                },
                exportTable: {
                  url: 'barter/taskList.json',
                  params: {},
                },
                multiplePageSelect: false,
                formatTableModel: (tableModel) => {
                  const { reportHeader = [], reportItem } = tableModel;

                  reportHeader.forEach((item) => {
                    if (item.featureKey === 'billedStatus') {
                      item.displayType = 'custom_fun';
                      item.width = 200;
                    }
                  });

                  if (reportItem.length > 0) {
                    for (let m = 0; m < reportItem.length; m++) {
                      const originValue = reportItem[m].billedStatus;
                      const fun = APPROVED_STATUS[originValue] || function () {};
                      reportItem[m].billedStatus = () => (<div>
                        {originValue}
                        {
                          APPROVED_STATUS[originValue] ? <Balloon trigger={<Icon size="small" type="prompt" />}>{fun(reportItem[m])}</Balloon> : null
                        }
                      </div>);
                    }
                  }
                  return Object.assign({}, { ...tableModel });
                },
              }}
              queryItem={this.getMarketingQueryItem()}
              btnConfig={this.getMarketingBtnConfig()}
              getSelectedFiled={this.getSelectedFiled}
              reloadTabel={this.state.reloadTabel}
              rowSelection={null}
              queryItemLayout={{
                labelCol: { fixedSpan: 6 },
                wrapperCol: { span: 18 },
              }}
            />
          </TabPane>
          <AltTabPane key={2} tab={"1"}>
            <RowSelectionTable
              tableConfig={this.getTableConfig()}
              queryItem={this.getQueryItem()}
              btnConfig={this.getBtnConfig()}
              getSelectedFiled={this.getSelectedFiled}
              reloadTabel={this.state.reloadTabel}
            />
          </AltTabPane>
          <TabPane key={3} tab={123}></TabPane>
          <TabPane key={4} tab={true && 123456}></TabPane>
        </Tab>
        {a() === 1 && (
          <Button>按钮111</Button>
        )}
        {a() === 1 && true && (
          <Button>按钮222{typeof APPROVED_STATUS}</Button>
        )}
      </div>
    );
  }
}


export default template({
  id: 'PartnerBills',
  component: PartnerBills,
});

function a() {
  // todo
  return 1
}

`

const GG = require('gogoast');
const AST = GG.createAstObj(code, { plugins: ['jsx'] });

const { nodePathList, matchWildCardList } = AST.getAstsBySelector(
  `this.state = {
    '$_$': $_$
  };`, false)

  matchWildCardList.forEach(item => {
    ///
    const { nodePathList1, matchWildCardList1 } = AST.getAstsBySelector([
      `const ${item} = $_$`, `let arrList = $_$`, `{ arrList: '$_$' }`
  ], false)
  })

// try {
    if (nodePathList.length) {
        nodePathList.forEach(path => {
            console.log(GG.generate(path.node))
            // if (path.node && path.node.declarations) {
            //     console.log(path.node.declarations[0].id.name)
            //     path.node.declarations[0].id.name = 'arrList111'
            //     console.log(GG.generate(path.node))
            // }
        })
    }
// } catch(e) {
//     console.log(e)
// }



// const code = `
//     import 'a.css';
//     import 'main.scss';
//     `
    
// const GG = require('gogoast');
// const AST = GG.createAstObj(code);

// const { nodePathList, matchWildCardList } = AST.getAstsBySelector(`import '$_$'`);
// matchWildCardList.forEach(item => {
//     if (item[0].value.match('main.scss')) {
//         item[0].structure.value = item[0].structure.value.replace('.scss', '.css');
//     }
// })

// const res = AST.generate();
// var a = 1
// const recast = require('recast')
// const babelParse = require('@babel/parser');
// const asttypes = require('ast-types');

// const code = `
//     const a = {
//         b: calc
//     }
// `
// const ast = recast.parse(code, {
//     parser: {
//         parse(code) {
//             return babelParse.parse(code);
//         }
//     }
// })

// asttypes.visit(ast, {
//     visitIdentifier(path) {
//         if (path.node.name == 'calc') {
//             path.replace(asttypes.builders.identifier('cal'))
//         }
//         this.traverse(path)
//     }
// })

// const res = recast.print(ast).code;
// var a = 1






// const G = require('gogoast');
// G.runJsPlugin({
//     pluginDir: 'test/plugin/js',
//     codeList: [
//     `function a(a){
//         var b = 1
//         aaaas
//     }`,
//     `navigateToOutside({
//         spmc: this.el.attr('data-spm'),
//         spmd: 'd_link',
//         url: this.options.link
//       });`,
//     `export default function calculateData(a, b){
//         console.log(11);
//     };`,
//     `var a = {
//         b: calc
//     };`]
// }).then(res => {
//     console.log(res)
// })