import _ from 'lodash'

export default function(requestBoardSection = {}){
    return {
        id: _.get(requestBoardSection, 'id', null),
        code: _.get(requestBoardSection, 'code', ''),
        cards: _.get(requestBoardSection, 'cards', []),
        size: _.get(requestBoardSection, 'size', 1),
        position: _.get(requestBoardSection, 'position', 0),
        updatedAt: _.get(requestBoardSection, 'updatedAt', null),
        createdAt: _.get(requestBoardSection, 'createdAt', null)
    }
}