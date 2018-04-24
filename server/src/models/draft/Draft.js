module.exports = class Draft {
    constructor(companyId, draftId, createdBy){
        this.companyId = companyId
        this.draftId = draftId
        this.createdBy = createdBy
    }
    setCompanyId(companyId){
        this.companyId = companyId
    }
    setDraftId(draftId){
        this.draftId = draftId
    }
    setCreatedBy(createdBy){
        this.createdBy = createdBy
    }
}