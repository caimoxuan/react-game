import React, { Component } from 'react';
import * as d3 from 'd3';

import './index.css';

const collpasePath = 'M14.5,11 C18.0898509,11 21,13.9101491 21,17.5 C21,21.0898509 18.0898509,24 14.5,24 C10.9101491,24 8,21.0898509 8,17.5 C8,13.9101491 10.9101491,11 14.5,11 Z M14.5,12 C11.4624339,12 9,14.4624339 9,17.5 C9,20.5375661 11.4624339,23 14.5,23 C17.5375661,23 20,20.5375661 20,17.5 C20,14.4624339 17.5375661,12 14.5,12 Z M15,15 L15,17 L17,17 L17,18 L15,18 L15,20 L14,20 L14,18 L12,18 L12,17 L14,17 L14,15 L15,15 Z';
const expandPath = 'M14.5,11 C18.0898509,11 21,13.9101491 21,17.5 C21,21.0898509 18.0898509,24 14.5,24 C10.9101491,24 8,21.0898509 8,17.5 C8,13.9101491 10.9101491,11 14.5,11 Z M14.5,12 C11.4624339,12 9,14.4624339 9,17.5 C9,20.5375661 11.4624339,23 14.5,23 C17.5375661,23 20,20.5375661 20,17.5 C20,14.4624339 17.5375661,12 14.5,12 Z M17,17 L17,18 L12,18 L12,17 L17,17 Z';

const rootPath = 'M37.3971916,39.2531471 L37.3971916,16.5 L33.9374354,13 L21.8020233,17.3778521 L21.8020233,18.6634875 L33.0666667,14.749998 L33.0666667,40.9999674 L40,40.9999674 L40,39.2531471 L37.3971916,39.2531471 Z M23.5329973,30.514182 L23.5329973,27.8633478 L17.4648713,29.6220442 L17.4648713,32.2561632 L23.5329973,30.514182 Z M23.5329973,34.9008118 L23.5329973,32.2499776 L17.4648713,34.0086739 L17.4648713,36.642793 L23.5329973,34.9008118 Z M23.5347927,39.2499695 L23.5347927,36.6249725 L17.4666667,38.3836688 L17.4666667,40.9999674 L23.5347927,39.2499695 Z M23.5347927,26.150822 L23.5347927,23.4999878 L17.4666667,25.2586841 L17.4666667,27.8928032 L23.5347927,26.150822 Z M27,18.235369 L14,22.6167713 L14,41 L15.7381045,41 L15.7381045,23.5056783 L25.270107,20.4459287 L25.2300441,41 L29.6728927,41 L29.6047078,20.0078825 L27,18.235369 Z';


export default class EnterpriseGraph extends Component {

	state = {
		type: ['left','right'],
		treeG: {},
		id: 0,
	};

	componentDidMount() {
		this.init();
	}

	init() {
		const { type } = this.state;
		const treeConfig = this.getTreeConfig();

		const zoom = d3.zoom()
			.scaleExtent([0.5, 2])
			.on('zoom', this.redraw);
		const svg = d3.select('#product_tree')
			.append('svg')
			.attr('width', treeConfig.chartWidth)
			.attr('height', treeConfig.chartHeight)
			.attr('xmlns', 'http://www.w3.org/2000/svg')
			.on('mousedown', this.disableRightClick)
			.call(zoom)
			.on('dblclick.zoom', null);
		// 定义需要引用的元素
		const defs = svg.append('defs');
		const collpase = defs.append('g').attr('id', 'collpaseIcon');
		collpase.append('rect').attr('width', 12).attr('height', 12).attr('opacity', 0)
			.attr('x', 8)
			.attr('y', 12);
		collpase.append('path').attr('d', collpasePath).attr('fill', '#979797');
		const expand = defs.append('g').attr('id', 'expandIcon');
		expand.append('rect').attr('width', 12).attr('height', 12).attr('opacity', 0)
			.attr('x', 8)
			.attr('y', 12);
		expand.append('path').attr('d', expandPath).attr('fill', '#979797');

		const g = svg.append('g')
			.attr('transform', `translate(${treeConfig.margin.left},${treeConfig.margin.top})`);
		
		const rootNode = g.append('g')
			.attr('transform', `translate(${treeConfig.centralWidth},${treeConfig.centralHeight})`);

		rootNode.append('circle')
			.attr('fill', '#1890FF')
			.attr('cx', 27)
			.attr('cy', 27)
			.attr('r', 27);
		rootNode.append('path')
			.attr('d', rootPath)
			.attr('fill', '#FFFFFF');
		const startX = treeConfig.centralWidth;
		const startY = treeConfig.centralHeight;
		// eslint-disable-next-line no-plusplus
		for (let i = 0; i < 2; i++) {
			const offsetWidth = i === 0 ? 54 : 0;
			const length = i === 0 ? 32 : -32;
			g.append('path')
				.attr('class', 'start_link')
				.attr('stroke', '#DBDBDB')
				.attr('fill', 'none')
				.attr('stroke-width', '1px')
				.attr('opacity', 1)
				.attr('d',
					`M${startX + offsetWidth},${startY + 27} L${startX + length + offsetWidth},${startY + 27}`);
		}

		const treeData = this.getTreeData();
		const rootName = treeData.name;

		// 公司名称绘制
		const nameLenght = rootName ? rootName.length / 4 : 0;
		// eslint-disable-next-line no-plusplus
		for (let i = 0; i < nameLenght; i++) {
			rootNode.append('text')
				.attr('class', 'root_node_name')
				.attr('y', 70 + 18 * i)
				.attr('x', -1)
				.attr('fill', '#1890FF')
				.style('font-size', 14)
				.style('font-weight', 'bold')
				.text(() => rootName.substring(i * 4, i * 4 + 4));
		}

		this.setState({ treeG: g }, () => {
			type.forEach((t) => {
				const nodeData = treeData[t];
				nodeData.type = t;
				const data = d3.hierarchy(nodeData);
				data.x0 = treeConfig.centralWidth;
				data.y0 = treeConfig.centralWidth;
				// data.children.forEach(this.collapse);
				this.update(data, data, g);
			});
		});
	}

	update = (source, originalData, g) => {
		const config = this.getTreeConfig();
		const { type } = originalData.data;
		const nodeClass = `${type}Node`;
		const linkClass = `${type}Link`;
		const downwardSign = type === 'left' ? -1 : 1;
		const isLeft = type === 'left';
		// 使用数据来构造树
		const tree = d3.tree().nodeSize([40])(originalData);
		// 获取树种的节点
		const nodes = tree.descendants();
		// 获取树中的链接
		const links = tree.links();
		// x方向上的偏移量
		const offsetY = -config.centralHeight;

		// 计算所有节点的位置
		nodes.forEach((d) => {
			const c = d;
			// 元素横向的定位.最后加上一个中间元素的一半宽度
			if (c.depth > 1) {
				c.y = downwardSign * (c.depth * 180) + config.centralWidth + 27;
			} else {
				c.y = downwardSign * (c.depth * 140) + config.centralWidth + 27;
			}
			c.x -= offsetY;
			if (c.data.type) {
				c.y = config.centralWidth;
				c.x += downwardSign * 0; // 上下两树图根节点之间的距离
			}
		});

		// Update the node.
		const node = g.selectAll(`g.${nodeClass}`)
			.data(nodes, (d) => {
				const c = d;
				if (c.id > 0) {
					return c.id;
				}
				// eslint-disable-next-line react/no-direct-mutation-state
				c.id = this.state.id++;
				return c.id;
			});
		const nodeEnter = node.enter().append('g')
			.attr('class', nodeClass)
			.attr('transform', `translate(${source.x0},${source.y0})`);
		// 节点的方框绘制
		nodeEnter.append('svg:rect')
			.attr('x', (d) => {
				const width = this.getRectWidth(d);
				// eslint-disable-next-line no-nested-ternary
				return (d.data.type) ? 0 : isLeft ? -width + 60 : -60;
			})
			// eslint-disable-next-line no-nested-ternary
			.attr('y', d => ((d.data.type) ? 0 : isLeft ? -48 : 12))
			.attr('width', d => ((d.data.type) ? 0 : this.getRectWidth(d)))
			.attr('height', 36)
			.attr('rx', 0) // 边框圆角
			.style('stroke', d => ((d.depth > 1) ? '#DBDBDB' : '#CCC'))
			.style('fill', d => ((d.depth > 1) ? d.parent.data.childrenFillColor : d.data.fillColor))
			.style('opacity', d => ((d.depth > 1) ? 1 : 0.1))
			.on('click', (d) => {
				// eslint-disable-next-line no-console
				console.log(d);
			});

		// 添加字体到节点中
		nodeEnter.append('text')
			.attr('class', 'linkname')
			.attr('x', (d) => {
				const offsetWidth = this.getExtraWidth(d);
				// eslint-disable-next-line no-nested-ternary
				return (d.data.type) ? '0' : isLeft ? d.depth > 1 ? 55 - offsetWidth : 50 : d.depth > 1 ? -55 - offsetWidth : -50;
			})
			// eslint-disable-next-line no-nested-ternary
			.attr('dy', d => ((d.data.type) ? '.35em' : isLeft ? '-27' : '34'))
			.attr('text-anchor', () => (isLeft ? 'end' : 'start'))
			.attr('fill', d => ((d.depth > 1) ? '#333333' : '#1890FF'))
			.text((d) => {
				if (d.data.type) {
					return '';
				}
				return d.data.name;
			})
			.style('fill-opacity', 1)
			.style('font-size', d => ((d.data.type) ? 14 : 12));
		nodeEnter.append('text')
			.attr('class', 'linkExtra')
			// eslint-disable-next-line no-nested-ternary
			.attr('x', d => ((d.data.type) ? '0' : isLeft ? d.depth > 1 ? 55 : 50 : d.depth > 1 ? -55 : -50))
			// eslint-disable-next-line no-nested-ternary
			.attr('dy', d => ((d.data.type) ? '.35em' : isLeft ? '-27' : '34'))
			.attr('text-anchor', () => (isLeft ? 'end' : 'start'))
			.attr('fill', (d) => {
				if (d.data.ratio) {
					return '#1890FF';
				}
				if (d.data.post) {
					return '#999999';
				}
				return '#fff';
			})
			.text((d) => {
				if (d.data.type || d.depth <= 1) {
					return '';
				}
				if (d.data.ratio) {
					return `[${d.data.ratio}]`;
				}
				if (d.data.post) {
					return `[${d.data.post}]`;
				}
				return '';
			})
			.style('fill-opacity', 1)
			.style('font-size', d => ((d.data.type) ? 14 : 12));
		// 添加展开标记
		const self = this;
		nodeEnter.append('use')
			.attr('width', 12)
			.attr('height', 12)
			.attr('x', (d) => {
				const width = this.getRectWidth(d);
				return isLeft ? -width + 63 : width - 93;
			})
			.attr('y', isLeft ? -48 : 12)
			.attr('href', d => (d.data.type || d.depth > 1 ? '' : '#expandIcon'))
			.style('cursor', 'pointer')
			.on('click', function clickNode(d) {
				self.nodeClick(d, originalData, this);
			});


		// 开始处理线
		const link = g.selectAll(`path.${linkClass}`)
			.data(links, d => d.target.id);
		link.enter().insert('path', 'g')
			.attr('class', linkClass)
			.attr('stroke', '#DBDBDB')
			.attr('fill', 'none')
			.attr('stroke-width', '1px')
			.attr('d',
				this.diagonal(source, source, type))
			.attr('marker-start', () => (isLeft ? 'url(#resolvedLeft)' : 'url(#resolvedRight)'))
			.attr('id', (d, i) => `mypath${i}`);

		// 变换节点到对应位置
		g.selectAll(`g.${nodeClass}`)
			.transition()
			.duration(config.duration)
			.attr('transform', d => `translate(${d.y},${d.x})`);
		// 变换线到对应位置
		const tranLink = g.selectAll(`path.${linkClass}`);
		tranLink.transition()
			.duration(config.duration)
			.attr('d', d => this.diagonal(d.source, d.target, type));


		// 开始处理展开节点的消失出现
		link.exit()
			.transition()
			.duration(config.duration)
			.attr('d', this.diagonal(source, source, type))
			.remove();
		node.exit()
			.transition()
			.duration(config.duration)
			.attr('transform', `translate(${source.y},${source.x})`)
			.remove();
		// 设置所有节点的开始的位置是中心节点的位置
		nodes.forEach((d) => {
			const c = d;
			c.x0 = d.y;
			c.y0 = d.x;
		});
	}

	// 获取初始化页面配置
	getTreeConfig() {
		return {
			'margin': {
				'top': 10,
				'right': 5,
				'bottom': 0,
				'left': 30,
			},
			chartWidth: window.innerWidth,
			chartHeight: window.innerHeight - 8,
			centralHeight: (window.innerHeight - 8) / 2,
			centralWidth: window.innerWidth / 2,
			duration: 500,
		};
	}
	// 处理缩放
	redraw = () => {
		const { treeG } = this.state;
		treeG.attr('transform', `translate(${d3.event.transform.x},${d3.event.transform.y})`.concat(` scale(${d3.event.transform.k})`));
	}
	// 线绘制
	diagonal = (s, d, direction) => {
		let path;
		const offsetWidth = d.depth > 1 ? 96 : 0;
		const offsetWidthR = d.depth > 1 ? 42 : 0;
		const shouldDrawX = d.depth > 1;
		const lengthX = 68;
		if (direction === 'left') {
			path = `M${d.y + 60} ${d.x - 30}`
				+ `L${s.y - 32 - offsetWidth} ${d.x - 30},`
				+ `${s.y - 32 - offsetWidth} ${s.x - 30}`;
			if (shouldDrawX) {
				const rectWidth = this.getRectWidth(d.parent);
				path += `,${s.y - 32 - offsetWidth + lengthX + (120 - rectWidth)} ${s.x - 30}`;
			}
		}

		if (direction === 'right') {
			path = `M${d.y - 60} ${d.x + 30}`
				+ `L${s.y + 54 + 32 + offsetWidthR} ${d.x + 30},`
				+ `${s.y + 54 + 32 + offsetWidthR} ${s.x + 30}`;
			if (shouldDrawX) {
				const rectWidth = this.getRectWidth(d.parent);
				path += `,${s.y + 54 + 32 + offsetWidthR - lengthX - (120 - rectWidth)} ${s.x + 30}`;
			}
		}
		return path;
	}

	// 关闭节点
	collapse = (d) => {
		const c = d;
		if (c.children && c.children.length !== 0) {
			c._children = c.children;
			c.children.forEach(this.collapse);
			c.children = null;
			//this.hasChildNodeArr.push(c.data.cid);
		}
	}
	// 展开节点
	expand = (d) => {
		const c = d;
		if (c._children) {
			c.children = d._children;
			c.children.forEach(this.expand);
			c._children = null;
		}
	}
	// 节点的点击事件
	nodeClick = (d, originalData, dom) => {
		const { treeG } = this.state;
		const c = d;
		if (c.children) {
			// 关闭node
			c._children = c.children;
			c.children = null;
			d3.select(dom).attr('href', '#collpaseIcon');
		} else {
			// 打开node
			c.children = c._children;
			c._children = null;
			d3.select(dom).attr('href', '#expandIcon');
		}
		this.update(c, originalData, treeG);
	}
	// 计算节点长度
	getRectWidth = (d) => {
		if (d.data.type) {
			return 0;
		}
		const offset = d.depth > 1 ? 10 : 40;
		const extraLength = this.getExtraWidth(d);
		return extraLength + d.data.name.length * 12 + offset;
	}

	getExtraWidth = (d) => {
		const ratioLength = d.data.ratio ? d.data.ratio.length * 8 : 0;
		const postLength = d.data.post ? d.data.post.length * 12 + 8 : 0;
		return ratioLength + postLength;
	}

	getTreeData() {
		return {
			'name': '数字浙江科技有限责任公司',
			'root': true,
			'left': {
				'children': [
					{
						'cid': 101,
						'childrenFillColor': '#fff',
						'fillColor': '#1890FF',
						'name': '股东',
						'children': [{
							'cid': 101,
							'name': '阿里巴巴（中国）网络技术有限公司',
							'ratio': '17.00',
						},
						{
							'cid': 102,
							'name': '浙江金控有限公司',
							'ratio': '17.00',
						},
						{
							'cid': 102,
							'name': '浙报智慧盈动创业投资（浙江）有限公司',
							'ratio': '17.00',
						},
						],
					},
					{
						'cid': 102,
						'name': '高管',
						'childrenFillColor': '#F3F9FD',
						'fillColor': '#1890FF',
						'children': [
							{
								'name': '张雪峰',
								'post': '董事长',
							},
							{
								'name': '张雪峰',
								'post': '董事',
							},
							{
								'name': '张雪峰',
								'post': '董事长',
							},
							{
								'name': '张雪峰',
								'post': '董事长',
							},
							{
								'name': '张雪峰',
								'post': '董事长',
							},
							{
								'name': '张雪峰',
								'post': '董事长',
							},
							{
								'name': '张雪峰',
								'post': '董事长',
							},
							{
								'name': '张雪峰',
								'post': '董事长',
							},
						],
					},
					{
						'cid': 103,
						'childrenFillColor': '#F3F9FD',
						'fillColor': '#1890FF',
						'name': '法人代表',
					},
					{
						'cid': 104,
						'fillColor': '#FA8700',
						'childrenFillColor': '#FFF7EE',
						'name': '历史股东',
					},
					{
						'cid': 105,
						'name': '历史法人代表',
						'fillColor': '#FA8700',
						'childrenFillColor': '#FFF7EE',
						'children': [
							{
								'cid': 1055,
								'name': '高管',
							},
						],
					},
				],
			},
			'right': {
				'children': [
					{
						'cid': 201,
						'name': '对外投资',
						'childrenFillColor': '#FFFFFF',
						'fillColor': '#1890FF',
						'children': [{
							'cid': 101,
							'name': '股东',
						},
						{
							'cid': 102,
							'name': '高管',
						}],
					},
					{
						'cid': 202,
						'name': '对内投资',
						'childrenFillColor': '#FFFFFF',
						'fillColor': '#1890FF',
					},
				],
			},
		};
	}

	render() {
		return (
			<div className="container" id="treecontainer">
				<div className="menu"></div>
				<div id="product_tree"></div>
		  </div>
		)
	}

}
