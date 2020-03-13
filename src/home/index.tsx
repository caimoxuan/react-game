import React, { Component } from 'react';
import { BrowserRouter, Route, RouteComponentProps } from 'react-router-dom';

import Game from '../game'
import GameRoom from '../component/common/GameRoom';
import Othello from '../game/othello';

interface HomePorps {

}

interface HomeState {

}

export default class Home extends Component<HomePorps, HomeState> {

    render() {
        return (
            <div>
                <BrowserRouter basename="/blog/game">
                    <Route path="/" exact render={(props: RouteComponentProps) => {
                        return <Game history={props.history} />
                    }}/>
                    <Route path="/othello" exact render={(props: RouteComponentProps) => {
                        return <GameRoom
                            history={props.history}
                            roomTargetKey="othello-"
                            maxRoomSize={12}
                            roomType="othello" />
                    }} />
                    <Route path="/othello/room" exact render={(props: RouteComponentProps) => {
                        return <Othello {...props} />
                    }}/>
                </BrowserRouter>
            </div>
        )
    }

}
