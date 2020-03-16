import React, { Component } from 'react';
import * as d3 from 'd3';

const expandIcon =
  "M89,0 C93.9705627,0 98,4.02943725 98,9 C98,13.9705627 93.9705627,18 89,18 C84.0294373,18 80,13.9705627 80,9 C80,4.02943725 84.0294373,0 89,0 Z M94,8 L84,8 L84,10 L94,10 L94,8 Z";
const collpaseIcon =
  "M89,0 C93.9705627,0 98,4.02943725 98,9 C98,13.9705627 93.9705627,18 89,18 C84.0294373,18 80,13.9705627 80,9 C80,4.02943725 84.0294373,0 89,0 Z M90,4 L88,4 L88,8 L84,8 L84,10 L87.999,10 L88,14 L90,14 L89.999,10 L94,10 L94,8 L90,8 L90,4 Z";
export default class EquityGraph extends Component {
		state = {
			expandPath: expandIcon,
			collpasePath: collpaseIcon,
			directions: ['downward', 'upward'],
			rootData: {},
			rootRectWidth: 100,
      treeG: {},
      id: 0,
      rootName: '',
		};
	
	componentDidMount() {
    let data = this.loadData('id');
    let rd = this.state.rootRectWidth; 
    if (data.name) {
      rd = data.name.length * 18 + 20;
    }
    this.setState({ rootName: data.name, rootRectWidth: rd}, () => {
      this.init(data);
    })
	}

	init = (data) => {
    this.setState({rootData: data}, () => {
      this.graphTree(this.treeConfig());
    })
	}

	graphTree = (treeConfig) => {
		let { expandPath , collpasePath, directions, rootData } = this.state;
		const zoom = d3
      .zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", this.redraw);

    const svg = d3
      .select("#product_tree")
      .append("svg")
      .attr(
        "width",
        treeConfig.chartWidth + treeConfig.margin.right + treeConfig.margin.left
      )
      .attr(
        "height",
        treeConfig.chartHeight
      )
      .attr("xmlns", "http://www.w3.org/2000/svg")
      // .on("mousedown", this.disableRightClick)
      .call(zoom)
      .on("dblclick.zoom", null);
    
		const g = svg
      .append("g")
      .attr("class", "gbox")
      .attr(
        "transform",
        `translate(${treeConfig.margin.left},${treeConfig.margin.top})`
      );
    // 展开合起图标
    const defs = svg.append("defs");
    const collpase = defs.append("g").attr("id", "collpaseIcon");
    collpase
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("opacity", 0)
      .attr("x", 83)
      .attr("y", 2);
    collpase
      .append("path")
      .attr("d", collpasePath)
      .attr("fill", "#A6CDF8");
    const expand = defs.append("g").attr("id", "expandIcon");
    expand
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("opacity", 0)
      .attr("x", 83)
      .attr("y", 2);
    expand
      .append("path")
      .attr("d", expandPath)
      .attr("fill", "#A6CDF8");

    // 箭头(下半部分)
    svg
      .append("marker")
      .attr("id", "resolvedDown")
      // .attr('markerUnits', 'strokeWidth') // 设置为strokeWidth箭头会随着线的粗细发生变化
      .attr("markerUnits", "userSpaceOnUse")
      .attr("viewBox", "0 -5 10 10") // 坐标系的区域
      .attr("refX", -4) // 箭头坐标
      .attr("refY", 0)
      .attr("markerWidth", 12) // 标识的大小
      .attr("markerHeight", 12)
      .attr("orient", "270") // 绘制方向，可设定为：auto（自动确认方向）和 角度值
      .attr("stroke-width", 1) // 箭头宽度
      .append("path")
      .attr("d", "M 0 -4 L 8 0 L 0 4 z") // 箭头的路径
      .attr("fill", "#1890FF"); // 箭头颜色

    // 箭头(上半部分)
    svg
      .append("marker")
      .attr("id", "resolvedUp")
      // .attr('markerUnits', 'strokeWidth') // 设置为strokeWidth箭头会随着线的粗细发生变化
      .attr("markerUnits", "userSpaceOnUse")
      .attr("viewBox", "0 -5 10 10") // 坐标系的区域
      .attr("refX", -5) // 箭头坐标
      .attr("refY", 0)
      .attr("markerWidth", 12) // 标识的大小
      .attr("markerHeight", 12)
      .attr("orient", "90") // 绘制方向，可设定为：auto（自动确认方向）和 角度值
      .attr("stroke-width", 1) // 箭头宽度
      .append("path")
      .attr("stroke", "#1890FF")
      .attr("d", "M 0 -4 L 8 0 L 0 4 z") // 箭头的路径
      .attr("fill", "#1890FF"); // 箭头颜色

    // Initialize the tree nodes and update chart.
    this.setState({ treeG: g }, () => {
      directions.forEach(direction => {
        const dirData = rootData[direction];
        let data = d3.hierarchy(dirData);
        data.x0 = treeConfig.centralWidth;
        data.y0 = treeConfig.centralHeight;
        (data.children || []).forEach(this.collapse);
        this.update(data, data, g);
      });
    });
	}

	update = (source, treeData, g) => {
    const { rootRectWidth, rootName } = this.state;
    const config = this.treeConfig();
    const { direction } = treeData.data;
    const downwardSign = direction === 'upward' ? -1 : 1;
    const forUpward = direction === 'upward' ? true : false; 
    const nodeClass = `${direction}Node`;
    const linkClass = `${direction}Link`;
    // 使用数据来构造树
    const tree = d3.tree().nodeSize([200, 0])(treeData);
    // 获取树种的节点
    const nodes = tree.descendants();
    // 获取树中的链接
    const links = tree.links();
    // x方向上的偏移量
    const offsetX = -config.centralWidth;
    // 计算所有节点的位置
    nodes.forEach((d) => {
      const c = d;
      const offsetY = d.depth > 1
        ? downwardSign * ((d.depth - 1) * 76) : 0;
      c.y = downwardSign * (c.depth * 110)
        + config.centralHeight + offsetY;
      c.x -= offsetX;
      if (c.data.name === 'origin') {
        c.x = config.centralWidth;
        c.y += 0; // 上下两树图根节点之间的距离
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
      .attr('transform', `translate(${source.x0},${source.y0})`)
      .attr('cursor', 'pointer');

    nodeEnter.append('svg:rect')
      .attr('x', d => ((d.data.name === 'origin') ? -(rootRectWidth / 2) : -89))
      .attr('y', d => ((d.data.name === 'origin') ? -20 : forUpward ? -90 : 12))
      .attr('width', d => ((d.data.name === 'origin') ? rootRectWidth : 178))
      .attr('height', d => ((d.data.name === 'origin') ? 40 : 76))
      .attr('rx', 0) // 边框圆角
      .style('stroke', d => ((d.data.name === 'origin') ? '' : '#CCC'))
      .style('fill', d => ((d.data.name === 'origin') ? '#1890FF' : '#FFF'))
      .on('click', (d) => {
        console.log(d);
      });

    nodeEnter.append('text')
      .attr('class', 'linkname')
      .attr('x', 0)
      // eslint-disable-next-line no-nested-ternary
      .attr('dy', (d) => {
        if (d.data.name === 'origin') {
          return '.35em';
        }
        const offset = d.data.name.length > 10 ? 10 : 20;
        return forUpward ? -76 + offset : 24 + offset;
      })
      .attr('text-anchor', 'middle')
      .text((d) => {
        if (d.data.name === 'origin') {
          return rootName;
        }
        return (d.data.name.length > 10) ? d.data.name.substr(0, 10) : d.data.name;
      })
      .style('fill-opacity', 1)
      .style('fill', d => (d.data.name === 'origin' ? '#fff' : '#000'))
      .style('font-size', d => ((d.data.name === 'origin') ? 18 : 14))
      .on('click', (d) => {
        console.log(d);
      });

    nodeEnter.append('text')
      .attr('class', 'linkname')
      .attr('x', '0')
      // eslint-disable-next-line no-nested-ternary
      .attr('dy', (d) => {
        const offset = d.data.name.length > 10 ? 26 : 36;
        return forUpward ? -76 + offset : 24 + offset;
      })
      .attr('text-anchor', 'middle')
      .text(d => d.data.name.substr(10, d.data.name.length))
      .style('font-size', 14)
      .on('click', (d) => {
        console.log(d);
      });

    nodeEnter.append('text')
      .attr('x', '0')
      // eslint-disable-next-line no-nested-ternary
      .attr('dy', (d) => {
        if (d.data.name === 'origin') {
          return '.35em';
        }
        const offset = d.data.name.length > 10 ? 42 : 36;
        return forUpward ? -76 + offset : 24 + offset;
      })
      .attr('text-anchor', 'middle')
      .attr('class', 'linkname')
      .style('fill', '#666')
      .style('font-size', 12)
      .text((d) => {
        const str = (d.data.name === 'origin') ? '' : `认缴金额:${d.data.amount}`;
        return (str.length > 16) ? `${str.substr(0, 16)}..` : str;
      });
    nodeEnter.append('text')
      .attr('x', '10')
      // eslint-disable-next-line no-nested-ternary
      .attr('dy', d => ((d.data.name === 'origin') ? '.35em' : forUpward ? 5 : 5))
      .attr('text-anchor', 'start')
      .attr('class', 'linkname')
      .style('fill', '#1890FF')
      .style('font-size', 12)
      .text(d => ((d.data.name === 'origin') ? '' : `${d.data.ratio}`));


    // Transition nodes to their new position.原有节点更新到新位置
    g.selectAll(`g.${nodeClass}`)
      .transition()
      .duration(config.duration)
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // 代表是否展开的+-号
    const self = this;
    nodeEnter.append('use')
      .attr('class', 'isExpand')
      .attr('x', -89)
      .attr('y', forUpward ? -108 : 89)
      .attr('href', d => ((d.data.name !== 'origin') ? '#collpaseIcon' : ''))
      .style('cursor', 'pointer')
      .on('click', function nodeClick(d) {
        self.nodeClick(d, treeData, this);
      });

    // 3.x在调用selection.data之前未定义selection.enter和selection.exit，如果尝试访问它们则会导致TypeError, 在4.0中直接是空要注意
    node.exit().transition()
      .duration(config.duration)
      .attr('transform', `translate(${source.x},${source.y})`)
      .remove();

    const link = g.selectAll(`path.${linkClass}`)
      .data(links, d => d.target.id);
    link.enter().insert('path', 'g')
      .attr('class', linkClass)
      .attr('stroke', '#8b4513')
      .attr('fill', 'none')
      .attr('stroke-width', '1px')
      .attr('opacity', 0.5)
      .attr('d', this.diagonal(source, source, direction))
      .attr('marker-start', forUpward ? 'url(#resolvedUp)' : 'url(#resolvedDown)') // 根据箭头标记的id号标记箭头;
      .attr('id', (d, i) => `mypath${i}`);
    // 让所有的线都链接到位
    const tranLink = g.selectAll(`path.${linkClass}`);
    tranLink.transition()
      .duration(config.duration)
      .attr('d', d =>  this.diagonal(d.source, d.target, direction));
    // 获取额外出现的线，让其消失
    link.exit().transition()
      .duration(config.duration)
      .attr('d', this.diagonal(source, source, direction))
      .remove();
    // 将所有节点的初始位置设置到主节点
    nodes.forEach((d) => {
      const c = d;
      c.x0 = c.x;
      c.y0 = c.y;
    });
	}

	loadData = (id) => {
		return {
      name: "平湖市九亭贸易有限公司",
      pripid: "3304820060100300",
      uniscid: "91330482MA29GEU99P",
      downward: {
        direction: "downward",
        name: "origin",
        children: [
          {
            cid: 201,
            name: "阿里巴巴（杭州）有限公司",
            amount: "100",
            ratio: "55%",
            hasHumanholding: true,
            hasChildren: true,
            isExpand: false,
            children: [
              {
                cid: 2011,
                name: "公司名字1",
                hasHumanholding: false,
                hasChildren: true,
                amount: "100",
                ratio: "55%",
                children: []
              },
              {
                cid: 2012,
                name: "公司名字2",
                hasHumanholding: false,
                hasChildren: true,
                amount: "100",
                ratio: "55%",
                children: []
              }
            ]
          },
          {
            cid: 202,
            name: "浙江天猫有限公司",
            amount: "100",
            ratio: "55%",
            hasHumanholding: true,
            hasChildren: true,
            isExpand: false,
            children: [
              {
                cid: 2021,
                name: "公司名字",
                hasHumanholding: false,
                hasChildren: true,
                amount: "100",
                ratio: "55%",
                children: []
              },
              {
                cid: 2022,
                name: "公司名字",
                hasHumanholding: false,
                hasChildren: true,
                amount: "100",
                ratio: "55%",
                children: [
                  {
                    cid: 20221,
                    name: "公司名字",
                    hasHumanholding: false,
                    hasChildren: true,
                    amount: "100",
                    ratio: "55%",
                    children: []
                  },
                  {
                    cid: 20222,
                    name: "公司名字",
                    hasHumanholding: false,
                    hasChildren: true,
                    amount: "100",
                    ratio: "55%",
                    children: []
                  }
                ]
              }
            ]
          },
          {
            cid: 203,
            name: "中国移动有限公司",
            amount: "100",
            ratio: "55%",
            hasHumanholding: true,
            hasChildren: true,
            isExpand: false,
            children: [
              {
                cid: 2031,
                name: "公司名字",
                hasHumanholding: false,
                hasChildren: true,
                amount: "100",
                ratio: "55%",
                children: []
              },
              {
                cid: 2032,
                name: "公司名字",
                hasHumanholding: false,
                hasChildren: true,
                amount: "100",
                ratio: "55%",
                children: []
              }
            ]
          },
          {
            cid: 204,
            name: "阿里云技术服务有限公司",
            hasHumanholding: false,
            hasChildren: true,
            amount: "100",
            ratio: "55%",
            children: []
          },
          {
            cid: 205,
            name: "钉钉科技有限公司",
            hasHumanholding: false,
            hasChildren: true,
            isExpand: false,
            amount: "100",
            ratio: "55%",
            children: [
              {
                cid: 2051,
                name: "公司或股东名字",
                hasHumanholding: false,
                amount: "100",
                ratio: "55%",
                children: []
              },
              {
                cid: 2052,
                name: "公司或股东名字",
                hasHumanholding: false,
                amount: "100",
                ratio: "55%",
                children: []
              },
              {
                cid: 2053,
                name: "公司或股东名字",
                hasHumanholding: false,
                amount: "100",
                ratio: "55%",
                children: []
              },
              {
                cid: 2054,
                name: "公司或股东名字",
                hasHumanholding: false,
                amount: "100",
                ratio: "55%",
                children: []
              }
            ]
          }
        ]
      },
      upward: {
        direction: "upward",
        name: "origin",
        children: [
          {
            amount: "40.0万人民币元",
            cid: "91330482050126605T",
            hasHumanholding: false,
            name: "嘉兴市兆通商贸有限公司",
            ratio: 18.18
          },
          {
            amount: "40.0万人民币元",
            cid: "91330482715442339R",
            hasHumanholding: false,
            name: "平湖市恒丰科技投资有限公司",
            ratio: 18.18
          },
          {
            amount: "30.0万人民币元",
            cid: "91330482680735544G",
            hasHumanholding: false,
            name: "平湖市海恒电子科技有限公司",
            ratio: 13.64
          },
          {
            amount: "10.0万人民币元",
            cid: "913304825693819957",
            hasHumanholding: false,
            name: "平湖市欣兴纸业有限公司",
            ratio: 4.55
          },
          {
            amount: "10.0万人民币元",
            cid: "91330482672588601A",
            hasHumanholding: false,
            name: "平湖市康弘进出口有限公司",
            ratio: 4.55
          },
          {
            amount: "10.0万人民币元",
            cid: "91330482146674059X",
            hasHumanholding: false,
            name: "平湖市东江实业有限公司",
            ratio: 4.55
          },
          {
            amount: "10.0万人民币元",
            cid: "91330482146666999U",
            hasHumanholding: false,
            name: "浙江红马铸造有限公司",
            ratio: 4.55
          },
          {
            amount: "10.0万人民币元",
            cid: "913304827420362721",
            hasHumanholding: false,
            name: "平湖市亚太物流有限公司",
            ratio: 4.55
          },
          {
            amount: "10.0万人民币元",
            cid: "91330482795585371W",
            hasHumanholding: false,
            name: "浙江宏阳新能源科技有限公司",
            ratio: 4.55
          },
          {
            amount: "10.0万人民币元",
            cid: "9133040277828610X3",
            hasHumanholding: false,
            name: "嘉兴市天秀建设工程有限公司",
            ratio: 4.55
          },
          {
            amount: "10.0万人民币元",
            cid: "913304826816633001",
            hasHumanholding: false,
            name: "平湖市通力机械有限公司",
            ratio: 4.55
          },
          {
            amount: "10.0万人民币元",
            cid: "91330482768650289L",
            hasHumanholding: false,
            name: "平湖市大亚纸管有限公司",
            ratio: 4.55
          },
          {
            amount: "5.0万人民币元",
            cid: "91330400076242073F",
            hasHumanholding: false,
            name: "平湖宏兴机械设备制造有限公司",
            ratio: 2.27
          },
          {
            amount: "5.0万人民币元",
            cid: "91330482794379074Y",
            hasHumanholding: false,
            name: "平湖市牧马人广告文化传媒有限公司",
            ratio: 2.27
          },
          {
            amount: "5.0万人民币元",
            cid: "913304825517690199",
            hasHumanholding: false,
            name: "平湖市正信房地产评估事务所(普通合伙)",
            ratio: 2.27
          },
          {
            amount: "5.0万人民币元",
            cid: "91330482725254972D",
            hasHumanholding: false,
            name: "平湖市正元资产评估事务所（普通合伙）",
            ratio: 2.27
          }
        ]
      }
    };
	}

	treeConfig = () => {
    return {
      margin: {
        top: 10,
        right: 5,
        bottom: 0,
        left: 30
      },
      chartWidth: window.innerWidth,
      chartHeight: window.innerHeight - 8,
      centralHeight: (window.innerHeight - 8) / 2,
      centralWidth: (window.innerWidth - 30 - 10) / 2,
      linkLength: 120,
      duration: 500
    };
	}

	redraw = () => {
		const { treeG } = this.state;
		treeG.attr(
      "transform",
      `translate(${d3.event.transform.x},${d3.event.transform.y})`.concat(
        ` scale(${d3.event.transform.k})`
      )
    );
  }
  
  // 关闭节点
  collapse = (d) => {
    const c = d;
    if (c.children && c.children.length !== 0) {
      c._children = c.children;
      c.children.forEach(this.collapse);
      c.children = null;
      // this.hasChildNodeArr.push(c.data.cid);
    }
  }
  // 展开节点
  expand = (d) => {
    const c = d;
    if (c._children) {
      c.children = c._children;
      c.children.forEach(this.expand);
      c._children = null;
    }
  }
  // 禁用鼠标右键在画布上的点击
  disableRightClick() {
    if (d3.event.button === 2) {
      d3.event.stopImmediatePropagation();
    }
  }

  // 路径绘制
  diagonal(s, d, direction) {
    let path;
    let offsetHeight = 60;
    if (s.data.name === 'origin') {
      offsetHeight = -18;
    }
    if (direction === 'upward') {
      path = `M ${d.x} ${d.y - 10}`
        + `C ${d.x} ${(d.y + s.y) / 2},`
        + `${s.x} ${(d.y)},`
        + `${s.x} ${s.y - offsetHeight}`;
    }

    if (direction === 'downward') {
      path = `M${d.x} ${d.y + 10}`
        + `C${d.x} ${(d.y + s.y) / 2},`
        + `${s.x} ${(d.y)},`
        + `${s.x} ${s.y + offsetHeight}`;
    }
    return path;
  }

  // 点击事件
  nodeClick(d, originalData, dom) {
    const { treeG } = this.state;
    if (d.data.name === 'origin') {
      return;
    }
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
      // expand all if it's the first node
      if (c.data.name === 'origin') {
        c.children.forEach(this.expand);
      }
      d3.select(dom).attr('href', '#expandIcon');
    }
    this.update(c, originalData, treeG);
  }

	render() {
		return (
			<div className="container" id="treecontainer">
			 <div id="product_tree"></div>
			</div>
		)
	}
}
