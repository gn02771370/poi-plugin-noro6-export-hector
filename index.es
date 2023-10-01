import React, { Component } from 'react'
import { Button, TextArea, ButtonGroup, Icon } from "@blueprintjs/core";
import { connect } from 'react-redux'
import { shell } from 'electron'
export const windowMode = false;

const parseShip = (ship) => {
    let tempObj =
    {
        "id": ship.api_ship_id,
        "lv": ship.api_lv,
        "st": ship.api_kyouka,
        "exp": ship.api_exp,
        "ex": ship.api_slot_ex
    }

    if (ship.api_sally_area) {
        tempObj.area = ship.api_sally_area
    }

    return tempObj;
}

const copyToClipboard = (result) => {
    const content = document.createElement('input'),
    text = result;
    document.body.appendChild(content);
    content.value = text;
    content.select();
    document.execCommand('copy');
    document.body.removeChild(content);
}



export const reactClass = connect(state => ({
    ships: state.info.ships,
    equips: state.info.equips
}))(class view extends Component {

    state = { result: "" };


    //裝備資料輸出(不包含未上鎖)
    exportequipsLocked = () => {
        const equips = this.props.equips;
        let result = `[`;
        const len = Object.keys(equips).pop();

        for (let j = 0; j < len; j++) {
            if (equips[j]) {
                const equip = equips[j];
                if (equip.api_locked == "0") {
                    continue;
                }
                if(equip.api_level == undefined) {
                    result += `{"id":${equip.api_slotitem_id},"lv":0},`
                }
                else {
                    result += `{"id":${equip.api_slotitem_id},"lv":${equip.api_level}},`
                }
            }
        }
        if (result.charAt(result.length - 1) == ',') {
            result = result.slice(0, result.length - 1)
        }
        result += `]`

        this.setState({ result })

        copyToClipboard(result)

        return result;
    }


    exportship_item = () => {
        const ships = this.props.ships;
        let result = []
        Object.values(ships)
            .filter(ship => {
                return ship.api_locked == "1"
            }).forEach(ship => {
                result.push(parseShip(ship))
            })

        let strResult = JSON.stringify(result)
        this.setState({ strResult })

        //複製到剪貼簿
        copyToClipboard(strResult)
    
        const resultitem = this.exportequipsLocked()
        let joined = "https://noro6.github.io/kc-web#import:{\"ships\":" + strResult + ",\"items\":" + resultitem + "}";

        copyToClipboard(joined)


        shell.openExternal(joined)

        return result;
    }

    render() {
        const result = this.state.result;
        return (
            <div>
                <h2>艦娘、装備情報</h2>
                <h5>(按下按鈕後可直接至瀏覽器貼上)</h5>
                <br />
                <Button onClick={this.exportship_item}>
                    複製至剪貼簿&nbsp;&nbsp;&nbsp;
                </Button>
            </div>
        )
    }
})