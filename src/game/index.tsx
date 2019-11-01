import React, { Component } from 'react';
import { BrowserRouterProps } from 'react-router-dom';

import GameBlock from '../component/common/GameBlock';
import OthelloImg from '../img/home/othello.jpg';

interface GameProps  extends BrowserRouterProps {
    history: any;
}

export default class Game extends Component<GameProps> {

    handleClick = (path: string) => {
        const { history } = this.props;
        history.push("/" + path);
    }

    render () {
        return (
            <div className="game-block" onClick={() => this.handleClick("othello")}>
                <GameBlock img={OthelloImg} description="黑白棋在西方和日本很流行。游戏通过相互翻转对方的棋子，最后以棋盘上谁的棋子多来判断胜负。它的游戏规则简单，因此上手很容易，但是它的变化又非常复杂。有一种说法是：只需要几分钟学会它，却需要一生的时间去精通它。" />            
            </div>
        )
    }
}