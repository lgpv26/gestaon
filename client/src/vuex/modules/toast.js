import iziToast from 'izitoast';

const state = {
}

const mutations = {
    show(state, payload){
        if(typeof payload !== 'undefined' && (!payload.hasOwnProperty('type') || payload.type === 'success')){
            iziToast.success({
                title: 'Sucesso',
                message: (typeof payload !== 'undefined' && typeof payload.message !== 'undefined') ? payload.message : 'Operação realizada com sucesso!'
            });
        }
        else if(typeof payload !== 'undefined' && (!payload.hasOwnProperty('type') || payload.type === 'warning')){
            iziToast.warning({
                title: 'Ops',
                message: (typeof payload !== 'undefined' && typeof payload.message !== 'undefined') ? payload.message : 'Algo aconteceu aqui...'
            });
        }
        else {
            iziToast.error({
                title: 'Erro',
                message: (typeof payload !== 'undefined' && typeof payload.message !== 'undefined') ? payload.message : 'Houve um erro.'
            });
        }
    },
    showError(state, error){
        const errors = error.errors;
        if(typeof errors !== 'undefined' && _.keys(errors.length > 0)){
            iziToast.error({
                title: 'Erro',
                message: errors[_.keys(errors).find(e => !!e)].message
            });
            return true;
        }
        if(_.has(error,'body')){
            iziToast.error({
                title: error.body.code,
                message: error.body.message
            });
            return true;
        }
        iziToast.error({
            title: 'Erro',
            message: "Houve um erro."
        });
    }
}

const actions = {
    showToast(context, payload){
        context.commit('show',payload);
    },
    showError(context, errorDetailed){
        context.commit('showError', errorDetailed);
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
