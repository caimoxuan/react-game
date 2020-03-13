import React, { Component } from 'react';
import { Card, Row, Col, message } from 'antd';
import { BrowserRouterProps } from 'react-router-dom';
import websocket from '../component/Socket';

import OthelloImg from '../img/home/othello.jpg';

import './index.css';

const { Meta } = Card;

interface GameProps  extends BrowserRouterProps {
    history: any;
}

export default class Game extends Component<GameProps> {

    componentDidMount() {
        websocket.onopen = (evt: any) => {
            message.info("连接服务器成功!");
        }
        websocket.onerror = (evt: any) => {
            message.error("连接服务器失败， 请稍后重试!");
        }
    }


    handleClick = (path: string) => {
        const { history } = this.props;
        if (websocket.readyState !== websocket.OPEN) {
            message.error("连接服务器失败，请稍后重试!");
            return;
        }
        history.push("/" + path);
    }

    render () {
        return (
            <div className="game-block-content">
                <Row gutter={24} >
                    <Col span={4}>
                        <div className="game-block-single">
                            <Card
                                onClick={() => this.handleClick('othello')}
                                
                                cover={<img alt="othello" src={OthelloImg} />}
                            >
                                <Meta title="奥赛罗棋" description="黑白棋在西方和日本很流行。游戏通过相互翻转对方的棋子，最后以棋盘上谁的棋子多来判断胜负。" />
                            </Card>
                        </div>
                    </Col>
                    <Col span={4}>
                        <div className="game-block-single">
                            <Card
                                hoverable
                                cover={<img alt="othello" src={OthelloImg} />}
                            >
                            </Card>
                        </div>
                    </Col>
                    <Col span={4}>
                        <div className="game-block-single">
                            <Card
                                hoverable
                                cover={<img alt="othello" src={OthelloImg} />}
                            >
                            </Card>
                        </div>
                    </Col>
                </Row>              
            
            </div>
            
        )
    }
}