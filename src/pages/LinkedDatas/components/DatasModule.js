import React, { Component } from 'react';
import { connect } from 'dva';
import { 
	Row, 
	Col,
	Icon, 
	message, 
	Table, 
	Popover, 
	Empty, 
	Select,
	Button,
	Progress
} from 'antd';
import moment from 'moment';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';
import { setFixed } from '@utils/utils';
import no_data_left1 from '@assets/no_data_left1.svg';
import no_data_left from '@assets/no_data_left.svg';
import no_data_bg1 from '@assets/no_data_bg1.svg';
import no_data_bg from '@assets/no_data_bg.svg';
import styles from './DatasModule.less';

const { Option } = Select;

@connect(state => ({
    msg: { ...state.linkedDatas },
    global: { ...state.global }
}))

class LinkedDatasStatistics extends Component {

    constructor(props) {
        super(props);
        this.state = {
        	dataList:[
	        	'groupCount',
	            'consultQuality',
	            'userCount',
	            'userTimeCount',
	            'consultCount',
	            'groupFormation',
	            'solvedQuestion',
	            'topQuestion',
	            'topGroup',
	            'notSolvedQuestion',
	            'recentConsult',
	            'recentUser',
	            'recentUserTime'
            ],
            dimensionList:[],
        	dimensionData:{},
            clientWidth: false,
            clientHeight: false,
            countModule: 'consult',
            hotspotModule: 'classify',
            extraCssText: 'background:#fff;color:#333;background:rgba(255,255,255,1); box-shadow:0px 1px 6px 0px rgba(177,177,177,0.5); border-radius:5px;',
        }
        this.saveRef = ref => { this.refDom = ref };
    }

    componentDidMount() {
    	this.getData();
        this.widthResize()
        window.addEventListener("resize", this.widthResize);
    }
    
    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'linkedDatas/setUninstall',
            payload: {}
        })
        window.removeEventListener("resize", this.widthResize);
    }
    
    widthResize = () => {
        const { clientWidth, clientHeight } = this.refDom;
        this.setState({ clientWidth, clientHeight })
    }

    getData = () => {
    	const { dataList } = this.state;
        const { dispatch,products } = this.props;
        let appIds = products.reduce((pev,item,index) => {
        	pev.push(item.bmAppId);
			return pev;
		},[]);
        dataList.map((item,index) => {
        	dispatch({
                type: 'linkedDatas/' + item,
                payload:{appIds}
            })
        })
    }
    
    //??????
    handleReturn = () => {
    	const { changeType } = this.props;
    	changeType('product');
    }
    
    //?????????
	noData = () => <div className={styles.no_data}>????????????</div>
	
	//?????????
	empty = () => <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span style={{ color: 'rgba(0, 0, 0, 0.25)' }}>????????????</span>}
    />
	
	//?????????
	setMax = (data,name) => {
		const max = data.sort((a,b) => {
			if(name){
				return b[name] - a[name];
			}else{
				return b - a;
			}
		})[0];
		return name ? max[name] : max;
	}
	
	//????????????
	setNumTip = (type,max,value) => {
		let num,txt;
		if(max < 10000){
			num = value;
			txt = '';
		}else
		if(max >= 10000 && max < 10000000){
			num = parseInt(value / 10000);
			txt = '???';
		}else{
			num = parseInt(value / 10000000);
			txt = '??????';
		}
		return type === 'txt' ? txt : num;
	}
	
	//??????
	headerModule(){
		const { products=[] } = this.props;
		const productName = products.reduce((pev,item,index) => {
			return pev += index ? '/' + item.productName : item.productName;
		},'');
		return(
			<div className={styles.headerBox}>
				<div className={styles.headerContent}>
					<Button 
						style={{marginRight:20}}
						onClick={this.handleReturn}
					>
						??????
					</Button>
					<span>???????????? : </span>{productName}
				</div>
				<div className={styles.timeBox}>
					???????????????{moment().format('YYYY-MM-DD')}
				</div>
			</div>
		)
	}
	
	businessContentModule() {    //????????????
        let { all } = this.props.msg.groupCount;
        let newItem = this.props.msg.groupCount.new;
        return <div className={`${styles.module} ${styles.color1}`}>
            <div className={styles.moduleTitle}>??????????????????</div>
            <div className={styles.moduleContent}>
                {
                    all || newItem ?
                        <>
                            <div className={styles.all_item}>
                                <div className={styles.big_font}>{all}</div>
                                <div>???</div>
                            </div>
                            <div className={styles.new_item}>{`???????????????${newItem}???`}</div>
                        </>
                        :
                        this.noData()
                }
            </div>
        </div>
    }

    consultationQualityModule() {    // ????????????
        let { all, unKnown } = this.props.msg.consultQuality
        let hitRate = 100 * (all - unKnown) / all
        if (isNaN(hitRate) || hitRate < 0 || hitRate > 100) {

            return <div className={`${styles.module} ${styles.color2}`}>
                <div className={styles.moduleTitle}>??????????????????</div>
                <div className={styles.moduleContent}>
                    {this.noData()}
                </div>
            </div>
        }
        const rate = hitRate.toFixed(2) + '%'
        return <div className={`${styles.module} ${styles.color2}`}>
            <div className={styles.moduleTitle}>??????????????????</div>
            <div className={styles.moduleContent}>
                <div className={styles.all_item}>
                    <div>??????????????????</div>
                    <div className={styles.big_font}>{rate}</div>
                </div>
            </div>
        </div>
    }

    ConsultationOrServedModule() {    // ??????????????????????????????
        let all
        let item
        const { countModule } = this.state
        const { msg } = this.props
        if (countModule == 'consult') {
            const { consultCount = {} } = msg
            all = consultCount.allConsult || 0
            item = consultCount.nowConsult || 0
        } else if (countModule == 'user') {
            const { userCount = {} } = msg
            all = userCount.allUser || 0
            item = userCount.nowUser || 0
        } else if (countModule == 'frequency') {
            const { userTimeCount = {} } = msg
            all = userTimeCount.allUserTime || 0
            item = userTimeCount.nowUserTime || 0
        }


        return <div className={`${styles.module} ${styles.color3}`}>
            <div className={styles.moduleTitle}>
                <a
                    style={
                        countModule == 'consult' ?
                            { color: '#fff' } : { color: '#0075C9' }
                    }
                    onClick={() => this.setState({ countModule: 'consult' })}
                >????????????</a>
                <Icon type="swap" className={styles.swap_icon} />
                <a
                    style={
                        countModule == 'user' ?
                            { color: '#fff' } : { color: '#0075C9' }
                    }
                    onClick={() => this.setState({ countModule: 'user' })}
                >????????????</a>
                <Icon type="swap" className={styles.swap_icon} />
                <a
                    style={
                        countModule == 'frequency' ?
                            { color: '#fff' } : { color: '#0075C9' }
                    }
                    onClick={() => this.setState({ countModule: 'frequency' })}
                >????????????</a>
            </div>
            <div className={styles.moduleContent}>
                {
                    all || item ?
                        <>
                            <div className={styles.swap_item}>
                                <div className={styles.big_font}>{all}</div>
                                <div>
                                    {
                                        countModule == 'user' ? '???' : '???'
                                    }
                                </div>
                            </div>
                            <div className={styles.bar}></div>
                            <div className={styles.swap_item}>
                                <div>???????????????</div>
                                <div className={styles.big_font}>{item}</div>
                                <div>
                                    {
                                        countModule == 'user' ? '???' : '???'
                                    }
                                </div>
                            </div>
                        </>
                        :
                        this.noData()
                }
            </div>
        </div >
    }

    BusinessDistributionModule() {    //??????????????????
        let { groupFormation = [] } = this.props.msg
        let len = groupFormation.length
        let data = []
        if (len > 0) {
            for (var i = 0; i < len; i++) {
                data.push({
                    name: groupFormation[i].group,
                    value: groupFormation[i].questionNum,
                    newValue: groupFormation[i].newQueNum
                })
            }
        } else {
            return <div className={`${styles.module} ${styles.no_color}  ${styles.width1}`}>
                <div className={styles.moduleTitle}>??????????????????</div>
                <div className={styles.moduleContent} style={{justifyContent: 'space-around'}}>
                    <img src={no_data_left1} className={styles.no_data_left1} />
                    {this.empty()}
                </div>
            </div>
        }
        data.sort((a, b) => b.value - a.value)
        let getOption = (data) => {
            return {
                tooltip: {
                    trigger: 'item',
                    padding: [10, 12],
                    extraCssText: this.state.extraCssText,
                    formatter: (params) => {
                        return `${params.data.name}:<br />???????????????${params.data.value}<br />???????????????${params.data.newValue} <br />?????????${params.percent}%`
                    }
                },
                color: [{
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#BB99FA' // 0% ????????????
                    }, {
                        offset: 1, color: '#865FF3' // 100% ????????????
                    }],
                    global: false // ????????? false
                }, {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#ACF3C3' // 0% ????????????
                    }, {
                        offset: 1, color: '#66C880' // 100% ????????????
                    }],
                    global: false // ????????? false
                }, {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#FFDA56' // 0% ????????????
                    }, {
                        offset: 1, color: '#FFB32B' // 100% ????????????
                    }],
                    global: false // ????????? false
                }, {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#73A7F9' // 0% ????????????
                    }, {
                        offset: 1, color: '#3F6EF0' // 100% ????????????
                    }],
                    global: false // ????????? false
                }, {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#F571AD' // 0% ????????????
                    }, {
                        offset: 1, color: '#C71A69' // 100% ????????????
                    }],
                    global: false // ????????? false
                }, {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#FFB3D9' // 0% ????????????
                    }, {
                        offset: 1, color: '#F679B7' // 100% ????????????
                    }],
                    global: false // ????????? false
                }, {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#FFB277' // 0% ????????????
                    }, {
                        offset: 1, color: '#F7933B' // 100% ????????????
                    }],
                    global: false // ????????? false
                }, {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#7AF4EA' // 0% ????????????
                    }, {
                        offset: 1, color: '#1BC7B9' // 100% ????????????
                    }],
                    global: false // ????????? false
                }, {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#8ECEFF' // 0% ????????????
                    }, {
                        offset: 1, color: '#4BB1FF' // 100% ????????????
                    }],
                    global: false // ????????? false
                }, {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#D5FFB9' // 0% ????????????
                    }, {
                        offset: 1, color: '#B6EA92' // 100% ????????????
                    }],
                    global: false // ????????? false
                }, {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#E6AEFF' // 0% ????????????
                    }, {
                        offset: 1, color: '#D882FF' // 100% ????????????
                    }],
                    global: false // ????????? false
                }, {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#FF9797' // 0% ????????????
                    }, {
                        offset: 1, color: '#E26464' // 100% ????????????
                    }],
                    global: false // ????????? false
                },
                ],
                series: [
                    {
                        name: '????????????',
                        type: 'pie',
                        radius: [15, '62%'],
                        center: ['50%', '50%'],
                        roseType: 'area',
                        // roseType: 'radius',
                        clockwise: false,
                        emphasis: {
                            label: {
                                show: true
                            }
                        },
                        data
                    }
                ]
            }
        }
        return <div className={`${styles.module} ${styles.no_color}  ${styles.width1}`}>
            <div className={styles.moduleTitle}>??????????????????</div>
            <div className={styles.moduleContent}>
                {
                    this.state.clientWidth ?
                        <ReactEcharts
                            option={getOption(data)}
                            style={{ width: (this.state.clientWidth * 0.26 - 16) + 'px', height: '250px' }}
                        />
                        : null

                }
            </div>
        </div>
    }

    resolvedProblemModule() {    //???????????????Top5
        let { solvedQuestion = [] } = this.props.msg;
        let len = solvedQuestion.length;
        let data = [];
        let axis = [];
        const { clientWidth } = this.state;
        if (len > 0) {
            for (var i = 0; i < len; i++) {
                data.push(solvedQuestion[i].allNum - solvedQuestion[i].notSolvedNum)
                axis.push(solvedQuestion[i].name)
            }
        } else {
            return <div className={`${styles.module} ${styles.no_color} ${styles.width2}`}>
                <div className={styles.moduleTitle}>???????????????Top???</div>
                <div className={styles.moduleContent}>
                    {this.empty()}
                    {
                        clientWidth > 1360 ? <img
                            src={no_data_bg1}
                            className={styles.no_data_img2}
                        /> : null
                    }

                </div>
            </div>
        }
		const maxNum = this.setMax(data);
        const txt = this.setNumTip('txt',maxNum);
        let getOption = (data, axis) => {
            return {
                // tooltip: {},
                tooltip: {
                    trigger: 'item',
                    padding: [10, 12],
                    extraCssText: this.state.extraCssText,
                    formatter: (params) => {
                        const { solvedQuestion } = this.props.msg
                        const { dataIndex } = params
                        const { allNum, name, notSolvedNum, toDayNum } = solvedQuestion[dataIndex]
                        let percent = (100 * (allNum - notSolvedNum) / allNum).toFixed(2) + '%'
                        return `${name}:<br />????????????????????????${allNum - notSolvedNum}<br />???????????????${toDayNum} <br />?????????${percent}`
                    }
                },
                grid: {
                    left: 55,       //??????canvas????????????????????????????????????????????????????????????????????????
                    right: 15,
                    bottom: 46,
                    top: 30
                },
                xAxis: {
                    data: axis,      //??????
                    boundaryGap: true,        //???????????????????????????
                    axisLine: {              //??????
                        show: false,
                    },
                    axisTick: {                   //????????????
                        show: false
                    },
                    splitLine: {                    //???????????????
                        lineStyle: {
                            type: 'dashed'    //????????????????????? dotted?????????   solid:??????
                        },
                        show: false          //?????????????????????/??????
                    },
                    axisLabel: {
                        interval: 0,
                        color: '#999999',
                        formatter: (value) => {
                            let data = value.split("")
                            switch (value.length) {
                                case 4:
                                    data.splice(2, 0, "\n")
                                    break;
                                case 5:
                                    data.splice(3, 0, "\n")
                                    break;
                                case 6:
                                    data.splice(3, 0, "\n")
                                    break;
                            }
                            return data.join("")
                        }
                    },
                },
                yAxis: {
                	name:`??????(${txt}???)`,
                	nameTextStyle: {
            			padding: [0, 0, 0, -60] 
        			},
                    minInterval: 1,
                    boundaryGap: [0, 0.1],
                    axisLine: {         //??????
                        show: false,
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    splitNumber: 3,            //????????????????????????
                    axisLabel: {
                        margin: 20,
                        color: '#999999',
                        formatter:(value, index) => {
                        	const num = Number(value);
                        	const label = this.setNumTip('num',maxNum,num);
                        	return label;
                        }
                    },
                },
                series: [{
                    name: '??????',
                    type: 'bar',
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    itemStyle: {
                        color: '#4425CE',
                        normal: {
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1,
                                [
                                    { offset: 0, color: '#ACB3FF' },                   //???????????????
                                    { offset: 1, color: '#636ED9' },                   //???????????????
                                ]
                            ),
                        },
                    },
                    barWidth: 16,
                    data
                }]
            }

        }
        return <div className={`${styles.module} ${styles.no_color} ${styles.width2}`}>
            <div className={styles.moduleTitle}>{len == 5 ? '???????????????Top5' : '???????????????Top???'}</div>
            <div className={styles.moduleContent} style={{paddingTop:10}}>
                {
                    clientWidth ?
                        <ReactEcharts
                            option={getOption(data, axis)}
                            style={{ width: (clientWidth * 0.248 - 16) + 'px', height: '230px' }}
                        /> : null

                }
            </div>
        </div>
    }

    hotspotClassifyOrProblemModule() {    //??????????????????????????????


        if (this.state.countModule == 'user') {
            const { recentUser = {} } = this.props.msg
            return <div className={`${styles.module} ${styles.no_color} ${styles.width3}`}>
                <div className={styles.moduleTitle}> ????????????????????????????????? </div>
                <div className={styles.moduleContent}>
                    {this.servedPeople(recentUser,'???')}
                </div>
            </div>
        } else if (this.state.countModule == 'frequency') {
            const { recentUserTime = {} } = this.props.msg
            return <div className={`${styles.module} ${styles.no_color} ${styles.width3}`}>
                <div className={styles.moduleTitle}> ????????????????????????????????? </div>
                <div className={styles.moduleContent}>
                    {this.servedPeople(recentUserTime,'???')}
                </div>
            </div>
        }

        let { topGroup: { groups = [] } } = this.props.msg
        return <div className={`${styles.module} ${styles.no_color} ${styles.width3}`}>
            <div className={styles.moduleTitle}>
                <a
                    style={
                        this.state.hotspotModule == 'classify' ?
                            { color: '#333333' } : { color: '#A4A4A4' }
                    }
                    onClick={() => this.setState({ hotspotModule: 'classify' })}
                >{groups.length == 5 ? '????????????top5' : '????????????top???'}</a>
                <Icon type="swap" className={styles.swap_icon} />
                <a
                    style={
                        this.state.hotspotModule == 'classify' ?
                            { color: '#A4A4A4' } : { color: '#333333' }
                    }
                    onClick={() => this.setState({ hotspotModule: 'user' })}
                >????????????Top5</a>
            </div>
            <div className={styles.moduleContent}>
                {
                    this.state.hotspotModule == 'classify' ?
                        this.hotspotClassify() : this.hotspotProblem()
                }
            </div>
        </div>
    }
    hotspotClassify = () => {   //????????????
        let { topGroup: { groups = [], allConsult: numAll } } = this.props.msg
        let len = groups.length
        let data = []
        let axis = []
        if (len > 0) {
            let j = 1
            for (var i = 0; i < len; i++) {
                if (!groups[i].name) {
                    groups[i].name = '??????' + j++
                }
                let { allConsult, name } = groups[i]
                data.push(allConsult)
                axis.push(name)
            }
        } else {
            return <div className={styles.hotspotClassify}>
                {this.empty()}
            </div>
        }
		const maxNum = this.setMax(data);
        const txt = this.setNumTip('txt',maxNum);
        let getOption = (data, axis, numAll) => {
            return {
                tooltip: {
                    trigger: 'item',
                    padding: [10, 12],
                    extraCssText: this.state.extraCssText,
                    formatter: (params) => {
                        let { groups } = this.props.msg.topGroup
                        const { dataIndex } = params
                        const { name, allConsult, toDayConsult } = groups[dataIndex]
                        let percent = (100 * allConsult / numAll).toFixed(2) + '%'
                        return `?????????????????????${name}<br />????????????${allConsult}<br />???????????????${toDayConsult} <br />?????????${percent}`
                    }
                },
                grid: {
                    left: 80,       //??????canvas????????????????????????????????????????????????????????????????????????
                    top: 20,
                    bottom: 46
                },
                yAxis: {
                    type: 'category',
                    data: axis,      //??????
                    boundaryGap: false,        //???????????????????????????
                    axisLine: {              //??????
                        show: false,
                    },
                    axisTick: {                   //????????????
                        show: false
                    },
                    splitLine: {                    //???????????????
                        lineStyle: {
                            type: 'dashed'    //????????????????????? dotted?????????   solid:??????
                        },
                        show: false          //?????????????????????/??????
                    },
                    axisLabel: {
                        color: '#999999',
                        interval: 0,
                        // rotate:40
                    },
                },
                xAxis: {
                    type: 'value',
                    name:`??????(${txt}???)`,
                    nameTextStyle: {
            			padding: [50, 0, 0, -10] 
        			},
                    minInterval: 1,
                    boundaryGap: [0, 0.1],
                    //max: value => parseInt(value.max * 1.1),
                    axisLine: {         //??????
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    splitNumber: 5,            //????????????????????????
                    axisLabel: {
                        margin: 20,
                        color: '#999999',
                        formatter:(value, index) => {
                        	const num = Number(value);
                        	const label = this.setNumTip('num',maxNum,num);
                        	return index <= 5 ? label : null;
                        }
                    },
                },
                series: [{
                    name: '??????',
                    type: 'bar',
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    itemStyle: {
                        color: '#4425CE',
                        normal: {
                            color: (params) => {
                                var colorList = ['#A5B1F1', '#9BE8CD', '#FFC579', '#A7DEF6', '#F6AEA7'];
                                return colorList[params.dataIndex]
                            }
                        }
                    },
                    barWidth: 16,
                    data
                }]
            }

        }

        return <div className={styles.hotspotClassify}>
            {
                this.state.clientWidth ?
                    <ReactEcharts
                        option={getOption(data, axis, numAll)}
                        style={{ width: (this.state.clientWidth * 0.488 - 16) + 'px', height: '230px' }}
                    /> : null
            }
        </div>
    }
    hotspotProblem = () => {    //????????????
        // topQuestion
        let { questions } = this.props.msg.topQuestion
        let columns = [
            {
                title: '??????',
                dataIndex: 'order',
                key: 'order',
                align: 'center',
                ellipsis: true,
                width: '15%'
            },
            {
                title: '????????????',
                dataIndex: 'name',
                key: 'name',
                align: 'center',
                ellipsis: true,
                width: '35%'
            },
            {
                title: '?????????',
                dataIndex: 'allConsult',
                key: 'allConsult',
                align: 'center',
                ellipsis: true,
                className: styles.table_all_consult,
                width: '20%',
                render: (text, record, index) => {
                    let { topQuestion: { questions, allConsult: numAll } } = this.props.msg
                    const { name, allConsult, toDayConsult } = record
                    let percent = (100 * allConsult / numAll).toFixed(2) + '%'
                    let content = (
                        <div>????????????:{name}<br />
                            ???????????????{allConsult}<br />
                            ???????????????{toDayConsult}<br />
                            ?????????{percent}</div>
                    )
                    return <Popover content={content}>{text} </Popover>
                }
            },
            {
                title: '??????',
                dataIndex: 'star',
                key: 'star',
                width: '30%',
                render: (text, record, index) => {
                    let starArr = []
                    for (var i = 0; i < text; i++) {
                        starArr.push(<Icon type="star" key={'star' + i} theme="filled" className={styles.star} />)
                    }
                    return <div className={styles.starArr}>
                        {starArr}
                    </div>
                }
            },
        ]
        return <div className={styles.table_div}>
            <Table
                columns={columns}
                dataSource={questions}
                pagination={false}
                size='small'
                rowKey={text => text.order}
                className={styles.table}
            />
        </div>
    }
    servedPeople = (recentUser,nameTxt) => {      //??????????????????????????????????????????
        let values = Object.values(recentUser)
        let valueArr = Object.values(recentUser)
        let haveValue = valueArr.some(item => item > 0)
        if (!haveValue) {
            return <div className={styles.hotspotClassify}>
                {this.empty()}
            </div>
        }
        let keys = Object.keys(recentUser).map(item => `${item.split(' ')[0].split('-')[2]}/${item.split(' ')[0].split('-')[1]}`)
        let showKeys = Object.keys(recentUser).map(item => `${item.split(' ')[0]}`)
        const maxNum = this.setMax(JSON.parse(JSON.stringify(values)));
        const txt = this.setNumTip('txt',maxNum);
        let getOption = (keys, values, showKeys) => {
            return {
                // tooltip: {},
                tooltip: {
                    trigger: 'item',
                    padding: [10, 12],
                    extraCssText: this.state.extraCssText,
                    formatter: (params) => {
                        // return  `${params.data.name}??????????????????${params.data.value}<br />???????????????${params.data.newValue} <br />?????????${params.percent}%`
                        return `${showKeys[params.dataIndex]}???????????????${params.value}`
                    }
                },
                grid: {
                    top: 28,
                    bottom: 28,
                    right: 10,
                    left: 60       //??????canvas????????????????????????????????????????????????????????????????????????
                },
                xAxis: {
                    type: 'category',
                    data: keys,          //??????
                    boundaryGap: true,                   //???????????????????????????
                    axisLine: {                          //??????
                        show: false,
                    },
                    axisTick: {                           //????????????
                        show: false
                    },
                    splitLine: {                         //???????????????
                        lineStyle: {
                            type: 'dashed'    //????????????????????? dotted?????????   solid:??????
                        },
                        show: false          //?????????????????????/??????
                    },
                    axisLabel: {
                        color: '#999999'
                    },
                },
                yAxis: {
                    type: 'value',
                    name:`??????(${txt}${nameTxt})`,
                    nameTextStyle: {
            			padding: [0, 0, 0, -50] 
        			},
                    minInterval: 1,
                    max: value => parseInt(value.max * 1.1),
                    boundaryGap: [0, 0.1],
                    axisLine: {                      //??????
                        show: false,
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    splitNumber: 3,            //????????????????????????
                    axisLabel: {
                        margin: 20,
                        color: '#999999',
                        formatter:(value, index) => {
                        	const num = Number(value);
                        	const label = this.setNumTip('num',maxNum,num);
                        	return label;
                        }
                    },
                },
                series: [{
                    name: '??????',
                    type: 'line',
                    smooth: 0.4,               //???????????????
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            color: '#999',
                        }
                    },
                    itemStyle: {
                        color: '#4842C5',
                    },
                    barWidth: 12,
                    data: values
                }]
            }
        }
        return <div className={styles.hotspotClassify}>
            {
                this.state.clientWidth ?
                    <ReactEcharts
                        option={getOption(keys, values, showKeys)}
                        style={{ width: (this.state.clientWidth * 0.488 - 100) + 'px', height: '230px' }}
                    /> : null
            }
        </div>

    }

    UnresolvedProblemModule() {    //?????????????????????
        const { clientWidth } = this.state;
        let { notSolvedQuestion } = this.props.msg;
        let len = notSolvedQuestion.length;
        let data = [];
        let leftDom = '';
        let solveNum = 0;
        let total = 0;
        let solvePercent = 0;
        const setWidth = (data) => {
        	const all = this.state.clientWidth * 0.46 - 56;
        	const num = 24 / data;
        	return all / num;
        }
        if (len > 0) {
            let j = 1
            for (var i = 0; i < len; i++) {
                if (!notSolvedQuestion[i].group) {
                    notSolvedQuestion[i].group = '??????' + j++
                }
                total = total + notSolvedQuestion[i].allNum;
                if(notSolvedQuestion[i].group !== '???????????????'){
                	data.push({
	                    name: notSolvedQuestion[i].group,
	                    value: notSolvedQuestion[i].allNum,
	                    newValue: notSolvedQuestion[i].newNum,
	                })
                }else{
                	solveNum = notSolvedQuestion[i].allNum;
                }
            }
            const percent = (solveNum / total);
            solvePercent = parseInt(percent * 10000) / 100;
            const unresolvedPercent = (100 - solvePercent).toFixed(2);
            if(unresolvedPercent){
            	let getOption = (data) => {
		            return {
		                tooltip: {
		                    trigger: 'item',
		                    padding: [10, 12],
		                    extraCssText: this.state.extraCssText,
		                    formatter: (params) => `${params.data.name}??????????????????${params.data.value}<br />???????????????${params.data.newValue} <br />?????????${params.percent}%`
		                },
		                color: ['#636ED9', '#D882FF', '#B6EA92', '#E26464', '#FFAE54', '#77F0DF', '#EA7A7A', '#4BB1FF', '#63D989', '#F0DA60', '#9F76FF', '#F88DC2'],
		                graphic: [
					        {
					            type: 'group',
					            left: '42%',
					            top: 160,
					            width: 100,
					            height: 100,
					            children: [
					                {
					                    type: 'text',
					                    z: 200,
					                    left: 'center',
					                    style: {
					                        fill: '#507CF1',
					                        fontSize: 20,
					                        text: [
					                            unresolvedPercent + "%"
					                        ].join('\n'),
					                        font: "16px Microsoft YaHei"
					                    }
					                }
					            ]
					        }
					    ],
		                series: [
		                    {
		                        type: 'pie',
		                        radius: ['40%', '70%'],
		                        center: ['50%', '40%'],
		                        clockwise: false,
		                        top: 70,
		                        emphasis: {
		                            label: {
		                                show: true
		                            }
		                        },
		                        data
		                    }
		                ]
		            }
		        }
	       
	            leftDom = clientWidth ? (
	            	<ReactEcharts
	                    option={getOption(data)}
	                    style={{ width:setWidth(14) + 'px', height: '315px' }}
	                />
	            ) : null;
            }else{
            	leftDom = (
	            	<div style={{width:'100%',height:'315px',textAlign:'center',lineHeight:'315px'}}>
	            		<img src={no_data_left} className={styles.no_data_left} />
	            	</div>
	            );
            }
        } else {
        	leftDom = (
            	<div style={{width:'100%',height:'315px',textAlign:'center',lineHeight:'315px'}}>
            		<img src={no_data_left} className={styles.no_data_left} />
            	</div>
            );
        }
		
        return <div className={`${styles.module} ${styles.no_color} ${styles.widthMax_left}`}>
            <div className={styles.moduleTitle}>?????????????????????</div>
            <div className={styles.moduleContentMax} id='unresolved'>
            	<Row>
            		<Col span={10} style={{height:'100%'}}>
                    	<div style={{height:'100%'}}>
                    		<div style={{height:'315px',textAlign:'center',lineHeight:'325px'}}>
                    			<Progress 
	                    			type="circle" 
	                    			width={setWidth(10) * 0.5} 
	                    			percent={solvePercent} 
	                    			strokeWidth={8} 
	                    			strokeColor='#507CF1' 
	                    		/>
                    		</div>
                    		<div className={styles.bottomTitle}>???????????????</div>
                    	</div>
                    </Col>
            		<Col span={14}>
	                    {leftDom}
	                    <div className={styles.bottomTitle}>???????????????</div>
                    </Col>
                </Row>
            </div>
        </div>
    }

    businessConsultationModule() {     //????????????????????????????????????
        let { recentConsult = [] } = this.props.msg
        let keysArr = Object.keys(recentConsult)
        let valueArr = Object.values(recentConsult)
        let haveValue = valueArr.some(item => item.length > 0)
        if (!haveValue) {
            return <div className={`${styles.module} ${styles.no_color} ${styles.widthMax_right}`}>
                <div className={styles.moduleTitle}>????????????????????????????????????</div>
                <div className={styles.moduleContentMaxEmty}>
                    <Empty
                        style={{ paddingBottom: '66px' }}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<span style={{ color: 'rgba(0, 0, 0, 0.25)' }}>????????????</span>}
                    />
                    <img src={no_data_bg} className={styles.no_data_img2} />
                </div>
            </div>
        }
        let xAxisData = keysArr.map((item, index) =>
            `${item.split('-')[2]}/${item.split('-')[1]}`
        )
        let allArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let seriesFun = (recentConsult) => {
            let keys = Object.keys(recentConsult)
            let seriesData = {}
            for (var j = 0; j < keys.length; j++) {
                let arr = recentConsult[keys[j]]
                for (var i = 0; i < arr.length; i++) {
                    let dataArr = arr[i].allConsult
                    let name
                    if (arr[i].servName) {
                        name = arr[i].servName
                    } else {
                        name = '??????' + j
                    }
                    if (seriesData[name]) {
                        seriesData[name].data[j] = dataArr
                    } else {
                        seriesData[name] = {
                            name,
                            type: 'bar',
                            barWidth: 16,
                            stack: 'item',
                            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            itemStyle: {
                                emphasis: {
                                    barBorderRadius: 1
                                },
                                normal: {
                                    barBorderRadius: 1
                                }
                            }
                        }
                        seriesData[name].data[j] = dataArr
                    }
                }
            }
            let series = Object.values(seriesData)
            for (var i = 0; i < series.length; i++) {
                allArr = series[i].data.map((item, index) => {
                    return item + allArr[index]
                })
            }
            let newallArr = []
            for (var i = 0; i < 10; i++) {
                let sum = 0;
                let numbers = allArr.slice(0, i + 1)
                for (let j = 0; j < numbers.length; j++) {
                    sum += numbers[j];
                }
                newallArr[i] = sum
            }
            series.push({
                name: '????????????',
                type: 'line',
                yAxisIndex: 1,
                data: newallArr,
                tooltip: {
                    trigger: 'item',
                    padding: [10, 12],
                    extraCssText: this.state.extraCssText,
                    formatter: (params) => {
                        const { seriesName, data, dataIndex } = params;
                        let todayNum = dataIndex == 0 ? data : data - newallArr[dataIndex - 1];
                        return `?????????????????????${seriesName}<br />???????????????${data}<br />???????????????${todayNum}`
                    }
                },
                lineStyle: {
                    color: 'rgb(255, 178, 83)'
                },
                // smooth: 0.1,
                itemStyle: {
                    color: 'rgb(255, 178, 83)'
                }
            })
            return series
        }
        let series = seriesFun(recentConsult)
        const barArr = [...series[0].data];
		const line = [...series[1].data];
		const barMax = this.setMax(barArr);
		const lineMax = this.setMax(line);
        const barTxt = this.setNumTip('txt',barMax);
        const lineTxt = this.setNumTip('txt',lineMax);
        let getOption = (xAxisData, series, allArr) => {
            let getColor = (a, b) => {
                return {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: a // 0% ??????????????????
                    }, {
                        offset: 1, color: b // 100% ??????????????????
                    }],
                    global: false // ????????? false
                }
            }

            return {
                // tooltip: {
                //     trigger: 'item',
                // },
                tooltip: {
                    trigger: 'item',
                    padding: [10, 12],
                    extraCssText: this.state.extraCssText,
                    formatter: (params) => {
                        const { seriesName, data, dataIndex } = params
                        let percent = (100 * data / allArr[dataIndex]).toFixed(2) + '%'
                        return `?????????????????????${seriesName}<br />???????????????${data}<br />?????????${percent}`
                    }
                },
                xAxis: {
                    type: 'category',
                    data: xAxisData,
                    boundaryGap: true,        //???????????????????????????
                    axisPointer: {
                        type: 'shadow'
                    },
                    axisLine: {              //??????
                        show: false,
                    },
                    axisTick: {                   //????????????
                        show: false
                    },
                    splitLine: {                    //?????????????????????/??????
                        show: false
                    },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: `??????(${barTxt}???)`,
                        nameTextStyle: {
            				padding: [0, 0, 0, -20] 
        				},
                        axisLine: {              //??????
                            show: false,
                        },
                        axisTick: {                   //????????????
                            show: false
                        },
                        splitLine: {                    //?????????????????????/??????
                            show: false
                        },
                        axisLabel: {
	                        formatter:(value, index) => {
	                        	const num = Number(value);
	                        	const label = this.setNumTip('num',barMax,num);
	                        	return label;
	                        }
	                    }
                    },
                    {
                        type: 'value',
                        name: `??????(${lineTxt}???)`,
                        nameTextStyle: {
            				padding: [0, 0, 0, 20] 
        				},
                        axisLine: {              //??????
                            show: false,
                        },
                        axisTick: {                   //????????????
                            show: false
                        },
                        splitLine: {                    //?????????????????????/??????
                            show: false
                        },
                        axisLabel: {
	                        formatter:(value, index) => {
	                        	const num = Number(value);
	                        	const label = this.setNumTip('num',lineMax,num);
	                        	return label;
	                        }
	                    }
                    }
                ],

                color: [
                    getColor('#6F7AF0', '#909AFF'),
                    getColor('#717CF1', '#939CFF'),
                    getColor('#7882EE', '#939DFF'),
                    getColor('#8690F4', '#929CFD'),
                    getColor('#8F99FF', '#A0A9FF'),
                    getColor('#8D96F7', '#A7AFFF'),
                    getColor('#939CFF', '#A8B0FC'),
                    getColor('#9EA6FF', '#AFB6FF'),
                    getColor('#A4ACFF', '#BBC1FC'),
                    getColor('#ABB2FA', '#C4CAFF'),
                    getColor('#BFC5FF', '#CED2FF'),
                    getColor('#D2D6FF', '#E0E2FC'),
                ],
                series
            };
        }

        return <div className={`${styles.module} ${styles.no_color} ${styles.widthMax_right}`}>
            <div className={styles.moduleTitle}>????????????????????????????????????</div>
            <div className={styles.moduleContentMax}>
                {
                    this.state.clientWidth ?
                        <ReactEcharts
                            option={getOption(xAxisData, series, allArr)}
                            style={{ width: (this.state.clientWidth * 0.54 - 16) + 'px', height: '350px' }}
                        /> : null

                }
            </div>
        </div>
    }

    render() {
        return (
            <div className={styles.package} ref={this.saveRef} >
                {this.headerModule()}
                <div className={styles.datasBox}>
                	<div className={styles.row} style={{paddingTop:5}}>
	                    {this.businessContentModule()}
	                    {this.consultationQualityModule()}
	                    {this.ConsultationOrServedModule()}
	                </div>
	                <div className={styles.row}>
	                    {this.BusinessDistributionModule()}
	                    {this.resolvedProblemModule()}
	                    {this.hotspotClassifyOrProblemModule()}
	                </div>
	                <div className={styles.row}>
	                    {this.UnresolvedProblemModule()}
	                    {this.businessConsultationModule()}
	                </div>
                </div>
            </div>
        )
    }
}

export default LinkedDatasStatistics;