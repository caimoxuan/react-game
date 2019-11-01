import React, { Component } from 'react';
import { BrowserRouter, Route, RouteComponentProps } from 'react-router-dom';

import Game from '../game'
import GameRoom from '../component/common/GameRoom';

interface HomePorps {

}

interface HomeState {

}

export default class Home extends Component<HomePorps, HomeState> {

    render() {
        return (
            <div>
                <BrowserRouter> 
                    <Route path="/" exact render={(props: RouteComponentProps) => {
                        return <Game history={props.history} />
                    }}/>               
                    <Route path="/othello" exact render={() => {
                        return <GameRoom roomTargetKey="othello-" maxRoomSize={10} />                       
                    }} />
                </BrowserRouter>
            </div>
        )
    }

}
