
import { handleScreenConfigurationFieldChange as handleField, prepareFinalObject, toggleSnackbar } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { getFileUrlFromAPI, getMultiUnits, getQueryArg, getTransformedLocale, setBusinessServiceDataToLocalStorage } from "egov-ui-framework/ui-utils/commons";
import { getapplicationNumber, getapplicationType, getOPMSTenantId, getUserInfo, setapplicationNumber, lSRemoveItemlocal, lSRemoveItem, localStorageGet, setapplicationMode, localStorageSet } from "egov-ui-kit/utils/localStorageUtils";
import jp from "jsonpath";
import get from "lodash/get";
import set from "lodash/set";
import store from "redux/store";
import { convertDateToEpoch, getCheckBoxJsonpath, getCurrentFinancialYear, getHygeneLevelJson, getLocalityHarmedJson, getSafetyNormsJson, getTradeTypeDropdownData, getTranslatedLabel, ifUserRoleExists, setFilteredTradeTypes, updateDropDowns, searchBill, createDemandForAdvNOC } from "../ui-config/screens/specs/utils";
import { httpRequest } from "./api";

import { setRoute } from "egov-ui-framework/ui-redux/app/actions";


const role_name = JSON.parse(getUserInfo()).roles[0].code


// export const updateTradeDetails = async requestBody => {
//   try {
//     const payload = await httpRequest(
//       "post",
//       "/tl-services/v1/_update",
//       "",
//       [],
//       requestBody
//     );
//     return payload;
//   } catch (error) {
//     store.dispatch(toggleSnackbar(true, error.message, "error"));
//   }
// };

// export const getLocaleLabelsforTL = (label, labelKey, localizationLabels) => {
//   if (labelKey) {
//     let translatedLabel = getTranslatedLabel(labelKey, localizationLabels);
//     if (!translatedLabel || labelKey === translatedLabel) {
//       return label;
//     } else {
//       return translatedLabel;
//     }
//   } else {
//     return label;
//   }
// };

export const getSearchResults = async queryObject => {

  let data = {
    "tenantId": getOPMSTenantId(),
    "applicationType": getapplicationType(),
    "applicationStatus": "INITIATED",
    "dataPayload": {
      "createdBy": JSON.parse(getUserInfo()).uuid,
      "applicationType": getapplicationType()
    }
  };
  try {
    const response = await httpRequest(
      "post",
      "/pm-services/noc/_get",
      "",
      [],
      data
    );
    //alert(JSON.stringify(response));
    return response;

  } catch (error) {
    store.dispatch(
      toggleSnackbar(
        true,
        { labelName: error.message, labelCode: error.message },
        "error"
      )
    );
  }

};

//view
export const getSearchResultsView = async queryObject => {
  try {
    const response = await httpRequest(
      "post", "/pm-services/noc/_view", "",
      [],
      {
        "tenantId": queryObject[0]["value"],
        "applicationId": queryObject[1]["value"],
        "applicationType": getapplicationType(),
        "dataPayload": {
          "createdBy": JSON.parse(getUserInfo()).uuid,
          "applicationType": getapplicationType()
        }
      }
    );
    return response;

  } catch (error) {
    store.dispatch(
      toggleSnackbar(
        true, { labelName: error.message, labelCode: error.message }, "error"
      )
    );
  }
  //alert(JSON.stringify(response));
};

export const preparepopupDocumentsUploadData = (state, dispatch, applicationtype = 'PETNOC') => {

  // if(applicationtype == 'PETNOC')
  // {
  let documents = get(
    state,
    "screenConfiguration.preparedFinalObject.applyScreenMdmsData.PetNOC.RemarksDocuments",
    []
  );
  // }	
  documents = documents.filter(item => {
    return item.active;
  });
  let documentsContract = [];
  let tempDoc = {};
  documents.forEach(doc => {
    let card = {};
    card["code"] = doc.documentType;
    card["title"] = doc.documentType;
    card["cards"] = [];
    tempDoc[doc.documentType] = card;
  });

  documents.forEach(doc => {
    // Handle the case for multiple muildings
    if (doc.code === "PET.REMARK_DOCUMENT_SI" && doc.hasMultipleRows && doc.options) {
      let buildingsData = get(state,
        "screenConfiguration.preparedFinalObject.FireNOCs[0].fireNOCDetails.buildings",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
    } else {
      let card = {};
      card["name"] = doc.code;
      card["code"] = doc.code;
      card["required"] = doc.required ? true : false;
      if (doc.hasDropdown && doc.dropdownData) {
        let dropdown = {};
        dropdown.label = "NOC_SELECT_DOC_DD_LABEL";
        dropdown.required = true;
        dropdown.menu = doc.dropdownData.filter(item => {
          return item.active;
        });
        dropdown.menu = dropdown.menu.map(item => {
          return { code: item.code, label: getTransformedLocale(item.code) };
        });
        card["dropdown"] = dropdown;
      }
      tempDoc[doc.documentType].cards.push(card);
    }
  });

  Object.keys(tempDoc).forEach(key => {
    documentsContract.push(tempDoc[key]);
  });

  dispatch(prepareFinalObject("documentsContract", documentsContract));
};

export const preparepopupDocumentsADVUploadData = (state, dispatch, applicationtype = 'ADVERTISEMENTNOC') => {

  // if(applicationtype == 'PETNOC')
  // {
  let documents = get(
    state,
    "screenConfiguration.preparedFinalObject.applyScreenMdmsData.AdvertisementNOC.AdvertisementNOCRemarksDocuments",
    []
  );
  // }	
  documents = documents.filter(item => {
    return item.active;
  });
  let documentsContract = [];
  let tempDoc = {};
  documents.forEach(doc => {
    let card = {};
    card["code"] = doc.documentType;
    card["title"] = doc.documentType;
    card["cards"] = [];
    tempDoc[doc.documentType] = card;
  });

  documents.forEach(doc => {
    // Handle the case for multiple muildings
    if (doc.code === "AdvertisementNOC.REMARK_DOCUMENT" && doc.hasMultipleRows && doc.options) {
      let buildingsData = get(state,
        "screenConfiguration.preparedFinalObject.FireNOCs[0].fireNOCDetails.buildings",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
    } else {
      let card = {};
      card["name"] = doc.code;
      card["code"] = doc.code;
      card["required"] = doc.required ? true : false;
      if (doc.hasDropdown && doc.dropdownData) {
        let dropdown = {};
        dropdown.label = "NOC_SELECT_DOC_DD_LABEL";
        dropdown.required = true;
        dropdown.menu = doc.dropdownData.filter(item => {
          return item.active;
        });
        dropdown.menu = dropdown.menu.map(item => {
          return { code: item.code, label: getTransformedLocale(item.code) };
        });
        card["dropdown"] = dropdown;
      }
      tempDoc[doc.documentType].cards.push(card);
    }
  });

  Object.keys(tempDoc).forEach(key => {
    documentsContract.push(tempDoc[key]);
  });

  dispatch(prepareFinalObject("documentsContract", documentsContract));
};

export const preparepopupDocumentsSellMeatUploadData = (state, dispatch, applicationtype = 'SELLMEATNOC') => {

  // if(applicationtype == 'PETNOC')
  // {
  let documents = get(
    state,
    "screenConfiguration.preparedFinalObject.applyScreenMdmsData.SellMeatNOC.SellMeatNOCRemarksDocuments",
    []
  );
  // }	
  documents = documents.filter(item => {
    return item.active;
  });
  let documentsContract = [];
  let tempDoc = {};
  documents.forEach(doc => {
    let card = {};
    card["code"] = doc.documentType;
    card["title"] = doc.documentType;
    card["cards"] = [];
    tempDoc[doc.documentType] = card;
  });

  documents.forEach(doc => {
    // Handle the case for multiple muildings
    if (doc.code === "SellMeatNOC.REMARK_DOCUMENT" && doc.hasMultipleRows && doc.options) {
      let buildingsData = get(state,
        "screenConfiguration.preparedFinalObject.FireNOCs[0].fireNOCDetails.buildings",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
    } else {
      let card = {};
      card["name"] = doc.code;
      card["code"] = doc.code;
      card["required"] = doc.required ? true : false;
      if (doc.hasDropdown && doc.dropdownData) {
        let dropdown = {};
        dropdown.label = "NOC_SELECT_DOC_DD_LABEL";
        dropdown.required = true;
        dropdown.menu = doc.dropdownData.filter(item => {
          return item.active;
        });
        dropdown.menu = dropdown.menu.map(item => {
          return { code: item.code, label: getTransformedLocale(item.code) };
        });
        card["dropdown"] = dropdown;
      }
      tempDoc[doc.documentType].cards.push(card);
    }
  });

  Object.keys(tempDoc).forEach(key => {
    documentsContract.push(tempDoc[key]);
  });

  dispatch(prepareFinalObject("documentsContract", documentsContract));
};
export const preparepopupDocumentsRoadCutUploadData = (state, dispatch, applicationtype = 'ROADCUTNOC') => {

  // if(applicationtype == 'PETNOC')
  // {
  let documents = get(
    state,
    "screenConfiguration.preparedFinalObject.applyScreenMdmsData.RoadCutNOC.RoadCutNOCRemarksDocuments",
    []
  );
  // }	
  documents = documents.filter(item => {
    return item.active;
  });
  let documentsContract = [];
  let tempDoc = {};
  documents.forEach(doc => {
    let card = {};
    card["code"] = doc.documentType;
    card["title"] = doc.documentType;
    card["cards"] = [];
    tempDoc[doc.documentType] = card;
  });

  documents.forEach(doc => {
    // Handle the case for multiple muildings
    if (doc.code === "RoadCutNOC.REMARK_DOCUMENT" && doc.hasMultipleRows && doc.options) {
      let buildingsData = get(state,
        "screenConfiguration.preparedFinalObject.FireNOCs[0].fireNOCDetails.buildings",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
    } else {
      let card = {};
      card["name"] = doc.code;
      card["code"] = doc.code;
      card["required"] = doc.required ? true : false;
      if (doc.hasDropdown && doc.dropdownData) {
        let dropdown = {};
        dropdown.label = "NOC_SELECT_DOC_DD_LABEL";
        dropdown.required = true;
        dropdown.menu = doc.dropdownData.filter(item => {
          return item.active;
        });
        dropdown.menu = dropdown.menu.map(item => {
          return { code: item.code, label: getTransformedLocale(item.code) };
        });
        card["dropdown"] = dropdown;
      }
      tempDoc[doc.documentType].cards.push(card);
    }
  });

  Object.keys(tempDoc).forEach(key => {
    documentsContract.push(tempDoc[key]);
  });

  dispatch(prepareFinalObject("documentsContract", documentsContract));
};

export const prepareDocumentsUploadData = (state, dispatch, type) => {
  let documents = '';
  if (type == "popup_pet") {
    documents = get(
      state,
      "screenConfiguration.preparedFinalObject.applyScreenMdmsData.PetNOC.RemarksDocuments",
      []
    );
  }
  else if (type == "popup_adv") {
    documents = get(
      state,
      "screenConfiguration.preparedFinalObject.applyScreenMdmsData.AdvertisementNOC.AdvertisementNOCRemarksDocuments",
      []
    );
  }
  else if (type == "popup_sellmeat") {
    documents = get(
      state,
      "screenConfiguration.preparedFinalObject.applyScreenMdmsData.SellMeatNOC.SellMeatNOCRemarksDocuments",
      []
    );
  }
  else if (type == "popup_rodcut") {
    documents = get(
      state,
      "screenConfiguration.preparedFinalObject.applyScreenMdmsData.RoadCutNOC.RoadCutNOCRemarksDocuments",
      []
    );
  }
  else if (type == "apply_pet") {
    documents = get(
      state,
      "screenConfiguration.preparedFinalObject.applyScreenMdmsData.PetNOC.Documents",
      []
    );
  }
  else if (type == "apply_sellmeat") {
    documents = get(
      state,
      "screenConfiguration.preparedFinalObject.applyScreenMdmsData.SellMeatNOC.SellMeatDocuments",
      []
    );
  }
  else if (type == "apply_Advt") {
    documents = get(
      state,
      "screenConfiguration.preparedFinalObject.applyScreenMdmsData.AdvNOC.AdvNOCDocuments",
      []
    );
  }
  else if (type == "apply_roadcut") {
    documents = get(
      state,
      "screenConfiguration.preparedFinalObject.applyScreenMdmsData.RoadCutNOC.RoadCutDocuments",
      []
    );
  }
  else {
    documents = get(
      state,
      "screenConfiguration.preparedFinalObject.applyScreenMdmsData.PetNOC.Documents",
      []
    );
  }

  documents = documents.filter(item => {
    return item.active;
  });
  let documentsContract = [];
  let tempDoc = {};
  documents.forEach(doc => {
    let card = {};
    card["code"] = doc.documentType;
    card["title"] = doc.documentType;
    card["cards"] = [];
    tempDoc[doc.documentType] = card;
  });

  documents.forEach(doc => {
    // Handle the case for multiple muildings
    if (doc.code === "PET.PET_PICTURE" && doc.hasMultipleRows && doc.options) {
      let buildingsData = get(state,
        "screenConfiguration.preparedFinalObject.FireNOCs[0].fireNOCDetails.buildings",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
    }
    else if (doc.code === "PET.REMARK_DOCUMENT_SI" && doc.hasMultipleRows && doc.options) {

      let buildingsData = get(state,
        "screenConfiguration.preparedFinalObject.FireNOCs[0].fireNOCDetails.buildings",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
    }
    else if (doc.code === "ADV.ADV_PHOTOCOPY_HOARDING" && doc.hasMultipleRows && doc.options) {

      let buildingsData = get(state,
        "screenConfiguration.preparedFinalObject.AdvNOC.AdvNOCDocuments",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
    }
    else if (doc.code === "SellMeatNOC.REMARK_DOCUMENT" && doc.hasMultipleRows && doc.options) {

      let buildingsData = get(state,
        "screenConfiguration.preparedFinalObject.FireNOCs[0].fireNOCDetails.buildings",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
    }
    else if (doc.code === "RoadCutNOC.REMARK_DOCUMENT" && doc.hasMultipleRows && doc.options) {

      let buildingsData = get(state,
        "screenConfiguration.preparedFinalObject.FireNOCs[0].fireNOCDetails.buildings",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
    }
    else if (doc.code === "AdvertisementNOC.REMARK_DOCUMENT" && doc.hasMultipleRows && doc.options) {

      let buildingsData = get(state,
        "screenConfiguration.preparedFinalObject.FireNOCs[0].fireNOCDetails.buildings",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
    }
    else if (doc.code === "SELLMEAT.PROOF_POSSESSION_RENT_AGREEMENT" && doc.hasMultipleRows && doc.options) {

      let buildingsData = get(state,
        "screenConfiguration.preparedFinalObject.applyScreenMdmsData.SellMeatNOC.SellMeatDocuments",
        []
      );

      buildingsData.forEach(building => {
        let card = {};
        card["name"] = building.name;
        card["code"] = doc.code;
        card["hasSubCards"] = true;
        card["subCards"] = [];
        doc.options.forEach(subDoc => {
          let subCard = {};
          subCard["name"] = subDoc.code;
          subCard["required"] = subDoc.required ? true : false;
          card.subCards.push(subCard);
        });
        tempDoc[doc.documentType].cards.push(card);
      });
      // let reduxDocuments = {};
      // previewdocu = get(state, "screenConfiguration.preparedFinalObject.nocApplicationDetail", {});
      // if(!previewdocu) {
      //   reduxDocuments = previewdocu;
      // } else  {      
      //   reduxDocuments = get(state, "screenConfiguration.preparedFinalObject.documentsUploadRedux", {});
      // }

    }
    else {
      let card = {};
      card["name"] = doc.code;
      card["code"] = doc.code;
      card["required"] = doc.required ? true : false;
      if (doc.hasDropdown && doc.dropdownData) {
        let dropdown = {};
        dropdown.label = "NOC_SELECT_DOC_DD_LABEL";
        dropdown.required = true;
        dropdown.menu = doc.dropdownData.filter(item => {
          return item.active;
        });
        dropdown.menu = dropdown.menu.map(item => {
          return { code: item.code, label: getTransformedLocale(item.code) };
        });
        card["dropdown"] = dropdown;
      }
      tempDoc[doc.documentType].cards.push(card);
    }
  });

  Object.keys(tempDoc).forEach(key => {
    documentsContract.push(tempDoc[key]);
  });

  dispatch(prepareFinalObject("documentsContract", documentsContract));
};


export const createUpdateNocApplication = async (state, dispatch, status) => {
  let response = '';
  let response_updatestatus = '';
  let nocId = getapplicationNumber() === 'null' ? '' : getapplicationNumber(); // get(state, "screenConfiguration.preparedFinalObject.PETNOC.applicationId");
  let method = nocId ? "UPDATE" : "CREATE";
  try {
    let payload = get(state.screenConfiguration.preparedFinalObject, "PETNOC", []);
    let reduxDocuments = get(state, "screenConfiguration.preparedFinalObject.documentsUploadRedux", {});
    // Set owners & other documents
    let ownerDocuments = [];
    let otherDocuments = [];
    let Remarks = "";

    jp.query(reduxDocuments, "$.*").forEach(doc => {
      if (doc.documents && doc.documents.length > 0) {
        if (doc.documentCode === "PET.PET_VACCINATION_CERTIFICATE") {
          ownerDocuments = [
            ...ownerDocuments,
            {
              //tenantId: 'ch',
              //documentType: doc.documentSubCode ? doc.documentSubCode : doc.documentCode,
              fileStoreId: doc.documents[0].fileStoreId
            }
          ];
        } else if (!doc.documentSubCode) {
          // SKIP BUILDING PLAN DOCS
          otherDocuments = [
            ...otherDocuments,
            {
              //tenantId: 'ch',
              //documentType: doc.documentCode,
              fileStoreId: doc.documents[0].fileStoreId
            }
          ];
        }
      }
    });

    set(payload, "uploadVaccinationCertificate", ownerDocuments);
    set(payload, "uploadPetPicture", otherDocuments);
    set(payload, "remarks", Remarks);
    // Set Channel and Financial Year
    // process.env.REACT_APP_NAME === "Citizen"
    //   ? set(payload, "channel", "CITIZEN")
    //   : set(payload, "channel", "COUNTER");
    // set(payload, "financialYear", "2020-21");
    console.log('payload : ', payload)
    setapplicationMode(status);

    if (method === "CREATE") {
      response = await httpRequest("post", "/pm-services/noc/_create", "", [], { dataPayload: payload });
      console.log('pet response : ', response)
      if (response.applicationId !== 'null' || response.applicationId !== '') {
        setapplicationNumber(response.applicationId);
        dispatch(prepareFinalObject("PETNOC", response));
        setApplicationNumberBox(state, dispatch);
        return { status: "success", message: response };
      } else {
        return { status: "fail", message: response };
      }
    } else if (method === "UPDATE") {
      response = await httpRequest("post", "/pm-services/noc/_update", "", [], { dataPayload: payload });
      if (status === 'RESENT') {
        response_updatestatus = await httpRequest("post", "/pm-services/noc/_updateappstatus", "", [], { dataPayload: {} });
      }
      setapplicationNumber(response.applicationId);
      // response = furnishNocResponse(response);
      dispatch(prepareFinalObject("PETNOC", response));
      return { status: "success", message: response };
    }

  } catch (error) {
    dispatch(toggleSnackbar(true, { labelName: error.message }, "error"));

    // Revert the changed pfo in case of request failure
    let fireNocData = get(
      state,
      "screenConfiguration.preparedFinalObject.PETNOC",
      []
    );
    // fireNocData = furnishNocResponse({ FireNOCs: fireNocData });
    dispatch(prepareFinalObject("PetNOC", fireNocData));

    return { status: "failure", message: error };
  }
};


export const setDocsForEditFlow = async (state, dispatch) => {

  const applicationDocuments = get(
    state.screenConfiguration.preparedFinalObject,
    "SELLMEATNOC.uploadDocuments",
    []
  );
  let uploadedDocuments = {};
  let fileStoreIds =
    applicationDocuments &&
    applicationDocuments.map(item => item.fileStoreId).join(",");
  const fileUrlPayload =
    fileStoreIds && (await getFileUrlFromAPI(fileStoreIds));
  applicationDocuments &&
    applicationDocuments.forEach((item, index) => {
      uploadedDocuments[index] = [
        {
          fileName:
            (fileUrlPayload &&
              fileUrlPayload[item.fileStoreId] &&
              decodeURIComponent(
                fileUrlPayload[item.fileStoreId]
                  .split(",")[0]
                  .split("?")[0]
                  .split("/")
                  .pop()
                  .slice(13)
              )) ||
            `Document - ${index + 1}`,
          fileStoreId: item.fileStoreId,
          fileUrl: Object.values(fileUrlPayload)[index],
          documentType: item.documentType,
          tenantId: item.tenantId,
          id: item.id
        }
      ];
    });
  dispatch(
    prepareFinalObject("SELLMEAT.uploadedDocsInRedux", uploadedDocuments)
  );
};

// export const updatePFOforSearchResults = async (
//   action,
//   state,
//   dispatch,
//   queryValue,
//   queryValuePurpose,
//   tenantId
// ) => {
//   let queryObject = [
//     {
//       key: "tenantId",
//       value: tenantId ? tenantId : getOPMSTenantId()
//     },
//     { key: "applicationNumber", value: queryValue }
//   ];
//   const isPreviouslyEdited = getQueryArg(window.location.href, "edited");
//   const payload = !isPreviouslyEdited
//     ? await getSearchResults(queryObject)
//     : {
//       Licenses: get(state.screenConfiguration.preparedFinalObject, "Licenses")
//     };
//   // const payload = await getSearchResults(queryObject)
//   // getQueryArg(window.location.href, "action") === "edit" &&
//   // (await setDocsForEditFlow(state, dispatch));

//   if (payload && payload.Licenses) {
//     dispatch(prepareFinalObject("Licenses[0]", payload.Licenses[0]));
//   }
//   const licenseType = payload && get(payload, "Licenses[0].licenseType");
//   const structureSubtype =
//     payload && get(payload, "Licenses[0].tradeLicenseDetail.structureType");
//   const tradeTypes = setFilteredTradeTypes(
//     state,
//     dispatch,
//     licenseType,
//     structureSubtype
//   );
//   const tradeTypeDdData = getTradeTypeDropdownData(tradeTypes);
//   tradeTypeDdData &&
//     dispatch(
//       prepareFinalObject(
//         "applyScreenMdmsData.TradeLicense.TradeTypeTransformed",
//         tradeTypeDdData
//       )
//     );
//   setDocsForEditFlow(state, dispatch);
//   updateDropDowns(payload, action, state, dispatch, queryValue);
//   if (queryValuePurpose !== "cancel") {
//     set(payload, getSafetyNormsJson(queryValuePurpose), "yes");
//     set(payload, getHygeneLevelJson(queryValuePurpose), "yes");
//     set(payload, getLocalityHarmedJson(queryValuePurpose), "No");
//   }
//   set(payload, getCheckBoxJsonpath(queryValuePurpose), true);

//   setApplicationNumberBox(state, dispatch);

//   createOwnersBackup(dispatch, payload);
// };

export const getBoundaryData = async (
  action,
  state,
  dispatch,
  queryObject,
  code,
  componentPath
) => {
  try {
    let payload = await httpRequest(
      "post",
      "/egov-location/location/v11/boundarys/_search?hierarchyTypeCode=REVENUE&boundaryType=Locality",
      "_search",
      queryObject,
      {}
    );
    const tenantId =
      process.env.REACT_APP_NAME === "Employee"
        ? get(
          state.screenConfiguration.preparedFinalObject,
          "Licenses[0].tradeLicenseDetail.address.city"
        )
        : getQueryArg(window.location.href, "tenantId");

    const mohallaData =
      payload &&
      payload.TenantBoundary[0] &&
      payload.TenantBoundary[0].boundary &&
      payload.TenantBoundary[0].boundary.reduce((result, item) => {
        result.push({
          ...item,
          name: `${tenantId
            .toUpperCase()
            .replace(/[.]/g, "_")}_REVENUE_${item.code
              .toUpperCase()
              .replace(/[._:-\s\/]/g, "_")}`
        });
        return result;
      }, []);

    dispatch(
      prepareFinalObject(
        "applyScreenMdmsData.tenant.localities",
        // payload.TenantBoundary && payload.TenantBoundary[0].boundary,
        mohallaData
      )
    );

    dispatch(
      handleField(
        "apply",
        "components.div.children.formwizardFirstStep.children.tradeLocationDetails.children.cardContent.children.tradeDetailsConatiner.children.tradeLocMohalla",
        "props.suggestions",
        mohallaData
      )
    );
    if (code) {
      let data = payload.TenantBoundary[0].boundary;
      let messageObject =
        data &&
        data.find(item => {
          return item.code == code;
        });
      if (messageObject)
        dispatch(
          prepareFinalObject(
            "Licenses[0].tradeLicenseDetail.address.locality.name",
            messageObject.name
          )
        );
    }
  } catch (e) {
    console.log(e);
  }
};

// const createOwnersBackup = (dispatch, payload) => {
//   const owners = get(payload, "Licenses[0].tradeLicenseDetail.owners");
//   owners &&
//     owners.length > 0 &&
//     dispatch(
//       prepareFinalObject(
//         "LicensesTemp[0].tradeLicenseDetail.owners",
//         JSON.parse(JSON.stringify(owners))
//       )
//     );
// };

// const getMultipleAccessories = licenses => {
// let accessories = get(licenses, "tradeLicenseDetail.accessories");
// let mergedAccessories =
// accessories &&
// accessories.reduce((result, item) => {
// if (item && item !== null && item.hasOwnProperty("accessoryCategory")) {
// if (item.hasOwnProperty("id")) {
// if (item.hasOwnProperty("active") && item.active) {
// if (item.hasOwnProperty("isDeleted") && !item.isDeleted) {
// set(item, "active", false);
// result.push(item);
// } else {
// result.push(item);
// }
// }
// } else {
// if (!item.hasOwnProperty("isDeleted")) {
// result.push(item);
// }
// }
// }
// return result;
// }, []);

// return mergedAccessories;
// };

// const getMultipleOwners = owners => {
//   let mergedOwners =
//     owners &&
//     owners.reduce((result, item) => {
//       if (item && item !== null && item.hasOwnProperty("mobileNumber")) {
//         if (item.hasOwnProperty("active") && item.active) {
//           if (item.hasOwnProperty("isDeleted") && !item.isDeleted) {
//             set(item, "active", false);
//             result.push(item);
//           } else {
//             result.push(item);
//           }
//         } else {
//           if (!item.hasOwnProperty("isDeleted")) {
//             result.push(item);
//           }
//         }
//       }
//       return result;
//     }, []);

//   return mergedOwners;
// };

// export const applyTradeLicense = async (state, dispatch, activeIndex) => {
//   try {
//     let queryObject = JSON.parse(
//       JSON.stringify(
//         get(state.screenConfiguration.preparedFinalObject, "Licenses", [])
//       )
//     );
//     let documents = get(
//       queryObject[0],
//       "tradeLicenseDetail.applicationDocuments"
//     );
//     set(
//       queryObject[0],
//       "validFrom",
//       convertDateToEpoch(queryObject[0].validFrom, "dayend")
//     );
//     set(queryObject[0], "wfDocuments", documents);
//     set(
//       queryObject[0],
//       "validTo",
//       convertDateToEpoch(queryObject[0].validTo, "dayend")
//     );
//     if (queryObject[0] && queryObject[0].commencementDate) {
//       queryObject[0].commencementDate = convertDateToEpoch(
//         queryObject[0].commencementDate,
//         "dayend"
//       );
//     }
//     let owners = get(queryObject[0], "tradeLicenseDetail.owners");
//     owners = (owners && convertOwnerDobToEpoch(owners)) || [];

//     //set(queryObject[0], "tradeLicenseDetail.owners", getMultipleOwners(owners));
//     const cityId = get(
//       queryObject[0],
//       "tradeLicenseDetail.address.tenantId",
//       ""
//     );
//     const tenantId = ifUserRoleExists("CITIZEN") ? cityId : getOPMSTenantId();
//     const BSqueryObject = [
//       { key: "tenantId", value: tenantId },
//       { key: "businessService", value: "newTL" }
//     ];
//     if (process.env.REACT_APP_NAME === "Citizen") {
//       let currentFinancialYr = getCurrentFinancialYear();
//       //Changing the format of FY
//       let fY1 = currentFinancialYr.split("-")[1];
//       fY1 = fY1.substring(2, 4);
//       currentFinancialYr = currentFinancialYr.split("-")[0] + "-" + fY1;
//       set(queryObject[0], "financialYear", currentFinancialYr);
//       setBusinessServiceDataToLocalStorage(BSqueryObject, dispatch);
//     }

//     set(queryObject[0], "tenantId", tenantId);

//     if (queryObject[0].applicationNumber) {
//       //call update

//       let accessories = get(queryObject[0], "tradeLicenseDetail.accessories");
//       let tradeUnits = get(queryObject[0], "tradeLicenseDetail.tradeUnits");
//       set(
//         queryObject[0],
//         "tradeLicenseDetail.tradeUnits",
//         getMultiUnits(tradeUnits)
//       );
//       set(
//         queryObject[0],
//         "tradeLicenseDetail.accessories",
//         getMultiUnits(accessories)
//       );
//       set(
//         queryObject[0],
//         "tradeLicenseDetail.owners",
//         getMultipleOwners(owners)
//       );

//       let action = "INITIATED";
//       if (
//         queryObject[0].tradeLicenseDetail &&
//         queryObject[0].tradeLicenseDetail.applicationDocuments
//       ) {
//         if (getQueryArg(window.location.href, "action") === "edit") {
//           // const removedDocs = get(
//           // state.screenConfiguration.preparedFinalObject,
//           // "LicensesTemp[0].removedDocs",
//           // []
//           // );
//           // set(queryObject[0], "tradeLicenseDetail.applicationDocuments", [
//           // ...get(
//           // state.screenConfiguration.prepareFinalObject,
//           // "Licenses[0].tradeLicenseDetail.applicationDocuments",
//           // []
//           // ),
//           // ...removedDocs
//           // ]);
//         } else if (activeIndex === 1) {
//           set(queryObject[0], "tradeLicenseDetail.applicationDocuments", null);
//         } else action = "APPLY";
//       }
//       // else if (
//       // queryObject[0].tradeLicenseDetail &&
//       // queryObject[0].tradeLicenseDetail.applicationDocuments &&
//       // activeIndex === 1
//       // ) {
//       // } else if (
//       // queryObject[0].tradeLicenseDetail &&
//       // queryObject[0].tradeLicenseDetail.applicationDocuments
//       // ) {
//       // action = "APPLY";
//       // }
//       set(queryObject[0], "action", action);
//       const isEditFlow = getQueryArg(window.location.href, "action") === "edit";
//       !isEditFlow &&
//         (await httpRequest("post", "/tl-services/v1/_update", "", [], {
//           Licenses: queryObject
//         }));
//       let searchQueryObject = [
//         { key: "tenantId", value: queryObject[0].tenantId },
//         { key: "applicationNumber", value: queryObject[0].applicationNumber }
//       ];
//       let searchResponse = await getSearchResults(searchQueryObject);
//       if (isEditFlow) {
//         searchResponse = { Licenses: queryObject };
//       } else {
//         dispatch(prepareFinalObject("Licenses", searchResponse.Licenses));
//       }
//       const updatedtradeUnits = get(
//         searchResponse,
//         "Licenses[0].tradeLicenseDetail.tradeUnits"
//       );
//       const tradeTemp = updatedtradeUnits.map((item, index) => {
//         return {
//           tradeSubType: item.tradeType.split(".")[1],
//           tradeType: item.tradeType.split(".")[0]
//         };
//       });
//       dispatch(prepareFinalObject("LicensesTemp.tradeUnits", tradeTemp));
//       createOwnersBackup(dispatch, searchResponse);
//     } else {
//       let accessories = get(queryObject[0], "tradeLicenseDetail.accessories");
//       let tradeUnits = get(queryObject[0], "tradeLicenseDetail.tradeUnits");
//       // let owners = get(queryObject[0], "tradeLicenseDetail.owners");
//       let mergedTradeUnits =
//         tradeUnits &&
//         tradeUnits.filter(item => !item.hasOwnProperty("isDeleted"));
//       let mergedAccessories =
//         accessories &&
//         accessories.filter(item => !item.hasOwnProperty("isDeleted"));
//       let mergedOwners =
//         owners && owners.filter(item => !item.hasOwnProperty("isDeleted"));

//       set(queryObject[0], "tradeLicenseDetail.tradeUnits", mergedTradeUnits);
//       set(queryObject[0], "tradeLicenseDetail.accessories", mergedAccessories);
//       set(queryObject[0], "tradeLicenseDetail.owners", mergedOwners);
//       set(queryObject[0], "action", "INITIATED");
//       //Emptying application docs to "INITIATE" form in case of search and fill from old TL Id.
//       if (!queryObject[0].applicationNumber)
//         set(queryObject[0], "tradeLicenseDetail.applicationDocuments", null);
//       const response = await httpRequest(
//         "post",
//         "/tl-services/v1/_create",
//         "",
//         [],
//         { Licenses: queryObject }
//       );
//       dispatch(prepareFinalObject("Licenses", response.Licenses));
//       createOwnersBackup(dispatch, response);
//     }
//     /* Application no. box setting */
//     setApplicationNumberBox(state, dispatch);
//     return true;
//   } catch (error) {
//     dispatch(toggleSnackbar(true, { labelName: error.message }, "error"));
//     console.log(error);
//     return false;
//   }
// };

// const convertOwnerDobToEpoch = owners => {
//   let updatedOwners =
//     owners &&
//     owners
//       .map(owner => {
//         return {
//           ...owner,
//           dob:
//             owner && owner !== null && convertDateToEpoch(owner.dob, "dayend")
//         };
//       })
//       .filter(item => item && item !== null);
//   return updatedOwners;
// };

export const getImageUrlByFile = file => {
  return new Promise(resolve => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = e => {
      const fileurl = e.target.result;
      resolve(fileurl);
    };
  });
};

export const getFileSize = file => {
  const size = parseFloat(file.size / 1024).toFixed(2);
  return size;
};

export const isFileValid = (file, acceptedFiles) => {
  const mimeType = file["type"];
  return (
    (mimeType &&
      acceptedFiles &&
      acceptedFiles.indexOf(mimeType.split("/")[1]) > -1) ||
    false
  );
};


export const furnishNocResponse = response => {
  // Handle applicant ownership dependent dropdowns
  let refurnishresponse = {};
  let applicationdetail = response.nocApplicationDetail[0].applicationdetail.length > 0 ? JSON.parse(response.nocApplicationDetail[0].applicationdetail) : '';

  //set(refurnishresponse, "applicationId", response.nocApplicationDetail[0].nocnumber);
  set(refurnishresponse, "applicantName", response.nocApplicationDetail[0].applicantname);
  set(refurnishresponse, "sector", response.nocApplicationDetail[0].sector);

  set(refurnishresponse, "nameOfPetDog", applicationdetail.nameOfPetDog);
  set(refurnishresponse, "age", applicationdetail.age);
  set(refurnishresponse, "sex", applicationdetail.sex);
  set(refurnishresponse, "breed", applicationdetail.breed);
  set(refurnishresponse, "color", applicationdetail.color);

  set(refurnishresponse, "identificationMark", applicationdetail.identificationMark);
  set(refurnishresponse, "immunizationNameVeterinaryDoctor", applicationdetail.immunizationNameVeterinaryDoctor);
  set(refurnishresponse, "veterinaryCouncilRegistrationNo", applicationdetail.veterinaryCouncilRegistrationNo);
  set(refurnishresponse, "immunizationContactDetail", applicationdetail.immunizationContactDetail);
  set(refurnishresponse, "immunizationClinicNo", applicationdetail.immunizationClinicNo);
  set(refurnishresponse, "immunizationSector", applicationdetail.immunizationSector);
  set(refurnishresponse, "uploadVaccinationCertificate", applicationdetail.uploadVaccinationCertificate);
  set(refurnishresponse, "uploadPetPicture", applicationdetail.uploadPetPicture);

  set(refurnishresponse, "houseNo", response.nocApplicationDetail[0].housenumber);
  set(refurnishresponse, "applieddate", applicationdetail.applieddate);
  set(refurnishresponse, "remarks", response.nocApplicationDetail[0].remarks);

  // set(refurnishresponse, "applicationuuid", applicationdetail.applicationuuid);
  // set(refurnishresponse, "applicationtype", applicationdetail.applicationtype);
  // set(refurnishresponse, "applicationstatus", response.nocApplicationDetail[0].applicationstatus);

  return refurnishresponse;
};

export const furnishSellMeatNocResponse = response => {
  // Handle applicant ownership dependent dropdowns
  let refurnishresponse = {};

  let applicationdetail = response.nocApplicationDetail[0].applicationdetail.length > 0 ? JSON.parse(response.nocApplicationDetail[0].applicationdetail) : '';

  //set(refurnishresponse, "applicationId", response.nocApplicationDetail[0].nocnumber);
  set(refurnishresponse, "applicantName", response.nocApplicationDetail[0].applicantname);
  set(refurnishresponse, "houseNo", response.nocApplicationDetail[0].housenumber);
  set(refurnishresponse, "sector", response.nocApplicationDetail[0].sector);

  set(refurnishresponse, "fatherHusbandName", applicationdetail.fatherHusbandName);
  set(refurnishresponse, "division", applicationdetail.division);
  set(refurnishresponse, "shopNumber", applicationdetail.shopNumber);
  set(refurnishresponse, "ward", applicationdetail.ward);
  set(refurnishresponse, "nocSought", applicationdetail.nocSought);

  set(refurnishresponse, "uploadDocuments", applicationdetail.uploadDocuments);
  set(refurnishresponse, "remarks", applicationdetail.remarks);

  return refurnishresponse;
};

export const furnishRoadcutNocResponse = response => {
  // Handle applicant ownership dependent dropdowns
  let refurnishresponse = {};

  let applicationdetail = response.nocApplicationDetail[0].applicationdetail.length > 0 ? JSON.parse(response.nocApplicationDetail[0].applicationdetail) : '';

  //set(refurnishresponse, "applicationId", response.nocApplicationDetail[0].nocnumber);
  set(refurnishresponse, "applicantName", response.nocApplicationDetail[0].applicantname);
  set(refurnishresponse, "sector", response.nocApplicationDetail[0].sector);

  set(refurnishresponse, "typeOfApplicant", applicationdetail.typeOfApplicant);
  set(refurnishresponse, "length", applicationdetail.length);
  set(refurnishresponse, "ward", applicationdetail.ward);
  set(refurnishresponse, "requestedLocation", applicationdetail.requestedLocation);
  set(refurnishresponse, "landmark", applicationdetail.landmark);
  set(refurnishresponse, "width", applicationdetail.width);
  set(refurnishresponse, "purposeOfRoadCutting", applicationdetail.purposeOfRoadCutting);
  set(refurnishresponse, "division", applicationdetail.division);
  set(refurnishresponse, "uploadDocuments", applicationdetail.uploadDocuments);
  set(refurnishresponse, "remarks", applicationdetail.remarks);

  return refurnishresponse;
};

export const furnishAdvertisementNocResponse = response => {
  // Handle applicant ownership dependent dropdowns
  let refurnishresponse = {};

  let applicationdetail = response.nocApplicationDetail[0].applicationdetail.length > 0 ? JSON.parse(response.nocApplicationDetail[0].applicationdetail) : '';

  //set(refurnishresponse, "applicationId", response.nocApplicationDetail[0].nocnumber);
  set(refurnishresponse, "applicantName", response.nocApplicationDetail[0].applicantname);
  set(refurnishresponse, "typeOfApplicant", applicationdetail.typeOfApplicant);
  set(refurnishresponse, "tan", applicationdetail.tan);
  set(refurnishresponse, "pan", applicationdetail.pan);
  set(refurnishresponse, "cin", applicationdetail.cin);
  set(refurnishresponse, "gstin", applicationdetail.gstin);
  set(refurnishresponse, "applicantAddress", applicationdetail.applicantAddress);
  set(refurnishresponse, "applicantLandmark", applicationdetail.applicantLandmark);
  set(refurnishresponse, "applicantDivision", applicationdetail.applicantDivision);
  set(refurnishresponse, "applicantWard", applicationdetail.applicantWard);
  set(refurnishresponse, "sector", response.nocApplicationDetail[0].sector);
  set(refurnishresponse, "applicantVillageSuSector", applicationdetail.applicantVillageSuSector);
  set(refurnishresponse, "mobileNo", applicationdetail.mobileNo);
  set(refurnishresponse, "emailId", applicationdetail.emailId);
  set(refurnishresponse, "typeOfAdvertisement", applicationdetail.typeOfAdvertisement);
  set(refurnishresponse, "subTypeOfAdvertisement", applicationdetail.subTypeOfAdvertisement);
  set(refurnishresponse, "fromDateToDisplay", applicationdetail.fromDateToDisplay);
  set(refurnishresponse, "toDateToDisplay", applicationdetail.toDateToDisplay);
  set(refurnishresponse, "duration", applicationdetail.duration);
  set(refurnishresponse, "locationOfAdvertisement", applicationdetail.locationOfAdvertisement);
  set(refurnishresponse, "advertisementLandmark", applicationdetail.advertisementLandmark);
  set(refurnishresponse, "advertisementSector", applicationdetail.advertisementSector);
  set(refurnishresponse, "advertisementVillageSubSector", applicationdetail.advertisementVillageSubSector);
  set(refurnishresponse, "advertisementMatterDescription", applicationdetail.advertisementMatterDescription);
  set(refurnishresponse, "space", applicationdetail.space);
  set(refurnishresponse, "date", applicationdetail.date);
  set(refurnishresponse, "exemptedCategory", applicationdetail.exemptedCategory);
  set(refurnishresponse, "uploadDocuments", applicationdetail.uploadDocuments);
  set(refurnishresponse, "remarks", applicationdetail.remarks);

  return refurnishresponse;
};


export const setApplicationNumberBox = (state, dispatch) => {

  let applicationNumber = get(state, "state.screenConfiguration.preparedFinalObject.PETNOC.applicationId", null);

  if (applicationNumber) {
    dispatch(
      handleField(
        "apply",
        "components.div.children.headerDiv.children.header.children.applicationNumber",
        "visible",
        true
      )
    );
    dispatch(
      handleField(
        "apply",
        "components.div.children.headerDiv.children.header.children.applicationNumber",
        "props.number",
        applicationNumber
      )
    );
  }
};

export const findItemInArrayOfObject = (arr, conditionCheckerFn) => {
  for (let i = 0; i < arr.length; i++) {
    if (conditionCheckerFn(arr[i])) {
      return arr[i];
    }
  }
};



export const getOPMSCards = async () => {
  // //alert('aaaaaaaaaa')
  let queryObject = [];
  var requestBody = {

  }

  try {
    const payload = await httpRequest(
      "post",
      "/egov-mdms-service/v1/_get?moduleName=egpm&masterName=ApplicationType&tenantId="`${getOPMSTenantId()}`,
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    store.dispatch(toggleSnackbar(true, error.message, "error"));
  }




};


export const getCitizenGridData = async () => {

  let queryObject = [];
  var requestBody = {
    "tenantId": `${getOPMSTenantId()}`,
    "applicationType": 'PETNOC',

    "dataPayload": {
      "applicationType": 'PETNOC',
      "applicationStatus": JSON.parse(getUserInfo()).roles[0].code == 'SI' ? 'INITIATED,REASSIGNTOSI,PAID,RESENT' : JSON.parse(getUserInfo()).roles[0].code == "MOH" ? 'FORWARD' : ''

    }

  }

  try {
    const payload = await httpRequest(
      "post",
      "/pm-services/noc/_get",
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    //  store.dispatch(toggleSnackbar(true, error.message, "error"));
  }




};

export const getSearchResultsForNocCretificate = async queryObject => {

  try {
    const response = await httpRequest("post", get(queryObject[3], "value"), "", [], get(queryObject[2], "value"));
    return response;
  } catch (error) {
    store.dispatch(
      toggleSnackbar(
        true,
        { labelName: error.message, labelCode: error.message },
        "error"
      )
    );
  }
  //alert(JSON.stringify(response));
};

export const getSearchResultsForNocCretificateDownload = async queryObject => {

  try {
    let filestoreIds = get(queryObject[2], "value");

    const response = await httpRequest(
      "get",
      get(queryObject[3], "value") + filestoreIds,
      "",
      []
    );
    return response;

  } catch (error) {
    //alert("rrrrr")
    store.dispatch(
      toggleSnackbar(
        true,
        { labelName: error.message, labelCode: error.message },
        "error"
      )
    );
  }
  //alert(JSON.stringify(response));
};


export const getGridDataAdvertisement1 = async () => {
  let queryObject = [];
  var requestBody = {
    "tenantId": `${getOPMSTenantId()}`,
    "applicationType": 'ADVERTISEMENTNOC',

    "dataPayload": {
      "applicationType": 'ADVERTISEMENTNOC',
      "applicationStatus": JSON.parse(getUserInfo()).roles[0].code == 'SI' ? 'INITIATE,REASSIGNTOSI,PAID,RESENT' : JSON.parse(getUserInfo()).roles[0].code == "MOH" ? 'FORWARD' : ''

    }

  }
  try {
    const payload = await httpRequest(
      "post",
      "/pm-services/noc/_get",
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    //  store.dispatch(toggleSnackbar(true, error.message, "error"));
  }
};


export const getGridDataRoadcut1 = async () => {
  let queryObject = [];
  var requestBody = {

    "tenantId": `${getOPMSTenantId()}`,
    "applicationType": 'ROADCUTNOC',

    "dataPayload": {
      "applicationType": 'ROADCUTNOC',
      "applicationStatus": JSON.parse(getUserInfo()).roles[0].code == 'SI' ? 'INITIATE,REASSIGNTOSI,PAID,RESENT' : JSON.parse(getUserInfo()).roles[0].code == "MOH" ? 'FORWARD' : ''

    }

  }
  try {
    const payload = await httpRequest(
      "post",
      "/pm-services/noc/_get",
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    //  store.dispatch(toggleSnackbar(true, error.message, "error"));
  }
};


export const getGridDataSellMeat1 = async () => {
  let queryObject = [];
  var requestBody = {

    "tenantId": `${getOPMSTenantId()}`,
    "applicationType": 'SELLMEATNOC',

    "dataPayload": {
      "applicationType": 'SELLMEATNOC',
      "applicationStatus": JSON.parse(getUserInfo()).roles[0].code == 'SI' ? 'INITIATE,REASSIGNTOSI,PAID,RESENT' : JSON.parse(getUserInfo()).roles[0].code == "MOH" ? 'FORWARD' : ''

    }

  }
  try {
    const payload = await httpRequest(
      "post",
      "/pm-services/noc/_get",
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    //store.dispatch(toggleSnackbar(true, error.message, "error"));
  }
};

export const UpdateMasterPrice = async (
  state, dispatch,
  queryObject,
  code
) => {

  try {
    const response = await httpRequest("post", "/pm-services/noc/_updatepricebook", "", [], code);

    if (response.ResposneInfo.status === 'SUCCESS') {
      //alert("Price Updated Successfully")
      //  window.location.reload(false);
      store.dispatch(
        toggleSnackbar(
          true,
          { labelName: 'Price Updated Successfully', labelCode: 'Price Updated Successfully' },
          "success"
        ),
        dispatch(setRoute(`/egov-opms/masterAdvertisement?purpose=updated`))
      );
      return response
    }
    else {
      store.dispatch(
        toggleSnackbar(
          true, { labelName: response.ResponseInfo.msgId, labelCode: response.ResponseInfo.msgId }, "error")
      );
    }
  } catch (error) {
    // store.dispatch(
    //   toggleSnackbar(
    //     true,
    //     { labelName: error.message, labelCode: error.message },
    //     "error"
    //   )
    // );
  }
};

export const createUpdateSellMeatNocApplication = async (state, dispatch, status) => {
  let response = '';
  let response_updatestatus = '';
  let nocId = getapplicationNumber() === 'null' ? '' : getapplicationNumber(); // get(state, "screenConfiguration.preparedFinalObject.SELLMEATNOC.applicationId");
  let method = nocId ? "UPDATE" : "CREATE";

  try {
    let payload = get(state.screenConfiguration.preparedFinalObject, "SELLMEATNOC", []);
    let tenantId = get(state.screenConfiguration.preparedFinalObject, "", getOPMSTenantId());

    let reduxDocuments = get(state, "screenConfiguration.preparedFinalObject.documentsUploadRedux", {});


    // Set owners & other documents
    let ownerDocuments = [];
    let otherDocuments = [];
    let Remarks = "";

    jp.query(reduxDocuments, "$.*").forEach(doc => {
      if (doc.documents && doc.documents.length > 0) {
        if (doc.documentCode === "SELLMEAT.PROOF_POSSESSION_RENT_AGREEMENT") {
          ownerDocuments = [
            ...ownerDocuments,
            {
              fileStoreId: doc.documents[0].fileStoreId
            }
          ];
        }
      }
    });
    set(payload, "uploadDocuments", ownerDocuments);
    set(payload, "remarks", Remarks);
    console.log('payload : ', payload)
    //
    let response = '';
    setapplicationMode(status);

    if (method === "CREATE") {

      response = await httpRequest("post", "/pm-services/noc/_create", "", [], { dataPayload: payload });
      console.log('pet response : ', response)
      if (response.applicationId !== 'null' || response.applicationId !== '') {
        dispatch(prepareFinalObject("SELLMEATNOC", response));
        setapplicationNumber(response.applicationId);
        setApplicationNumberBox(state, dispatch);
        return { status: "success", message: response };
      } else {
        return { status: "fail", message: response };
      }
    } else if (method === "UPDATE") {
      response = await httpRequest("post", "/pm-services/noc/_update", "", [], { dataPayload: payload });
      if (status === 'RESENT') {
        response_updatestatus = await httpRequest("post", "/pm-services/noc/_updateappstatus", "", [], { dataPayload: {} });
      }
      // response = furnishNocResponse(response);
      setapplicationNumber(response.applicationId);
      dispatch(prepareFinalObject("SELLMEATNOC", response));
      return { status: "success", message: response };
    }

  } catch (error) {
    dispatch(toggleSnackbar(true, { labelName: error.message }, "error"));

    // Revert the changed pfo in case of request failure
    let sellMeatNocData = get(
      state,
      "screenConfiguration.preparedFinalObject.SELLMEATNOC",
      []
    );
    dispatch(prepareFinalObject("SELLMEATNOC", sellMeatNocData));

    return { status: "failure", message: error };
  }
};


export const createUpdateRoadCutNocApplication = async (state, dispatch, status) => {
  let response = '';
  let response_updatestatus = '';
  let nocId = getapplicationNumber() === 'null' ? '' : getapplicationNumber();
  //  get(state, "screenConfiguration.preparedFinalObject.ROADCUTNOC.applicationId");
  let method = nocId ? "UPDATE" : "CREATE";
  try {
    let payload = get(state.screenConfiguration.preparedFinalObject, "ROADCUTNOC", []);
    let reduxDocuments = get(state, "screenConfiguration.preparedFinalObject.documentsUploadRedux", {});

    // Set owners & other documents
    let ownerDocuments = [];
    let otherDocuments = [];
    let Remarks = "";

    jp.query(reduxDocuments, "$.*").forEach(doc => {
      if (doc.documents && doc.documents.length > 0) {
        if (doc.documentCode === "ROADCUT.FILE_NAME") {
          ownerDocuments = [
            ...ownerDocuments,
            {
              fileStoreId: doc.documents[0].fileStoreId
            }
          ];
        } else if (!doc.documentSubCode) {
          // SKIP BUILDING PLAN DOCS
          otherDocuments = [
            ...otherDocuments,
            {
              fileStoreId: doc.documents[0].fileStoreId
            }
          ];
        }
      }
    });

    set(payload, "uploadDocuments", ownerDocuments);
    set(payload, "remarks", Remarks);

    console.log('Road CUt payload : ', payload)
    setapplicationMode(status);

    if (method === "CREATE") {
      response = await httpRequest("post", "/pm-services/noc/_create", "", [], { dataPayload: payload });
      console.log('pet response : ', response)
      if (response.applicationId !== 'null' || response.applicationId !== '') {
        dispatch(prepareFinalObject("ROADCUTNOC", response));
        setapplicationNumber(response.applicationId);
        setApplicationNumberBox(state, dispatch);
        return { status: "success", message: response };
      } else {
        return { status: "fail", message: response };
      }
    } else if (method === "UPDATE") {
      response = await httpRequest("post", "/pm-services/noc/_update", "", [], { dataPayload: payload });
      // response = furnishNocResponse(response);
      if (status === 'RESENT') {
        response_updatestatus = await httpRequest("post", "/pm-services/noc/_updateappstatus", "", [], { dataPayload: payload });
      }
      setapplicationNumber(response.applicationId);
      dispatch(prepareFinalObject("ROADCUTNOC", response));
      return { status: "success", message: response };
    }

  } catch (error) {
    dispatch(toggleSnackbar(true, { labelName: error.message }, "error"));

    // Revert the changed pfo in case of request failure
    let fireNocData = get(state, "screenConfiguration.preparedFinalObject.ROADCUTNOC", []);
    // fireNocData = furnishNocResponse({ FireNOCs: fireNocData });
    dispatch(prepareFinalObject("ROADCUTNOC", fireNocData));

    return { status: "failure", message: error };
  }
};

export const createUpdateADVNocApplication = async (state, dispatch, status) => {
  let response = '';
  let response_updatestatus = '';
  let nocId = getapplicationNumber() === 'null' ? '' : getapplicationNumber();
  let method = nocId ? "UPDATE" : "CREATE";
  //let method = "CREATE";
  try {
    let payload = get(state.screenConfiguration.preparedFinalObject, "ADVERTISEMENTNOC", []);
    let reduxDocuments = get(state, "screenConfiguration.preparedFinalObject.documentsUploadRedux", {});
    // Set owners & other documents
    let ownerDocuments = [];
    let Remarks = "";
    jp.query(reduxDocuments, "$.*").forEach(doc => {
      if (doc.documents && doc.documents.length > 0) {
        if (doc.documentCode === "ADV.ADV_PHOTOCOPY_HOARDING") {
          ownerDocuments = [
            ...ownerDocuments,
            {
              fileStoreId: doc.documents[0].fileStoreId
            }
          ];
        }
      }
    });
    set(payload, "uploadDocuments", ownerDocuments);
    set(payload, "remarks", Remarks);
    //set(payload, "exemptedCategory", 0)

    status = payload['exemptedCategory'] === "1" ? 
                      status==="INITIATED"
                      ? "INITIATEDEXC" 
                      : status  
                  : status;
    // localStorageGet(`exemptedCategory`) === null ?
    // set(payload, "exemptedCategory", 0)
    // : set(payload, "exemptedCategory", localStorageGet(`exemptedCategory`)) :
    // set(payload, "exemptedCategory", 0);

    setapplicationMode(status);
    let responsecreateDemand = '';
    if (method === "CREATE") {
      //specially for calculating service
      dispatch(prepareFinalObject("ADVTCALCULATENOC", payload));

      response = await httpRequest("post", "/pm-services/noc/_create", "", [], { dataPayload: payload });
      if (response.applicationId !== 'null' || response.applicationId !== '') {
        dispatch(prepareFinalObject("ADVERTISEMENTNOC", response));
        setapplicationNumber(response.applicationId);
        setApplicationNumberBox(state, dispatch);
        //calculate service called
        responsecreateDemand = await createDemandForAdvNOC(state, dispatch);
        //calculate search Bill called
        responsecreateDemand.Calculations[0].taxHeadEstimates[0].estimateAmount > 0 ?
          await searchBill(dispatch, response.applicationId, getOPMSTenantId()) : '';

        lSRemoveItem(`exemptedCategory`);
        lSRemoveItemlocal(`exemptedCategory`);
        return { status: "success", message: response, createDemand: responsecreateDemand };
      } else {
        return { status: "fail", message: response, createDemand: responsecreateDemand };
      }
    } else if (method === "UPDATE") {
      response = await httpRequest("post", "/pm-services/noc/_update", "", [], { dataPayload: payload });
      // response = furnishNocResponse(response);
      if (status === 'RESENT') {
        response_updatestatus = await httpRequest("post", "/pm-services/noc/_updateappstatus", "", [], { dataPayload: {} });
      }
      setapplicationNumber(response.applicationId);
      setApplicationNumberBox(state, dispatch);
      dispatch(prepareFinalObject("ADVERTISEMENTNOC", response));
      return { status: "success", message: response };
    }
  } catch (error) {
    dispatch(toggleSnackbar(true, { labelName: error.message }, "error"));

    // Revert the changed pfo in case of request failure
    //let fireNocData = get(state, "screenConfiguration.preparedFinalObject.ADVERTISEMENTNOC", []);
    //fireNocData = furnishAdvertisementNocResponse({ FireNOCs: fireNocData });
    //dispatch(prepareFinalObject("ADVERTISEMENTNOC", fireNocData));
    return { status: "failure", message: error };
  }
};


export const getUpdatePriceBook1 = async (pricebookid) => {
  let queryObject = [];
  var requestBody = {

    "tenantId": getOPMSTenantId(),
    "applicationType": "ADVERTISEMENTNOC",
    "applicationStatus": "UPDATE",
    "dataPayload": {
      "priceBookId": pricebookid
    }
  }
  try {
    const payload = await httpRequest(
      "post",
      "/pm-services/noc/_viewPriceBook",
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    store.dispatch(toggleSnackbar(true, error.message, "error"));
  }
};
export const getCategory1 = async () => {
  let queryObject = [];
  var requestBody = {
    "MdmsCriteria": { "tenantId": getOPMSTenantId(), "moduleDetails": [{ "moduleName": "egpm", "masterDetails": [{ "name": "typeOfAdvertisement" }] }] }
  }
  try {
    const payload = await httpRequest(
      "post",
      "/egov-mdms-service/v1/_search",
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    store.dispatch(toggleSnackbar(true, error.message, "error"));
  }
};

export const getSubCategory1 = async () => {
  let queryObject = [];
  var requestBody = {

    "MdmsCriteria": { "tenantId": getOPMSTenantId(), "moduleDetails": [{ "moduleName": "egpm", "masterDetails": [{ "name": "subTypeOfAdvertisement" }] }] }
  }
  try {
    const payload = await httpRequest(
      "post",
      "/egov-mdms-service/v1/_search",
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    store.dispatch(toggleSnackbar(true, error.message, "error"));
  }
};


export const getMasterGridData1 = async () => {

  let queryObject = [];
  var requestBody = {


    "tenantId": getOPMSTenantId(),
    "applicationType": "ADVERTISEMENTNOC",
    "applicationStatus": "UPDATE",
    "dataPayload": {
      "priceBookId": ""
    }
  }

  try {
    const payload = await httpRequest(
      "post",
      "/pm-services/noc/_viewPriceBook",
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    store.dispatch(toggleSnackbar(true, error.message, "error"));
  }




};

export const getMISSummaryReport = async data => {
  try {
    const response = await httpRequest(
      "post",
      "/report/pm-services/MISSummaryReport/_get",
      "",
      [],
      data
    );
    //alert(JSON.stringify(response));
    return response;

  } catch (error) {
    store.dispatch(
      toggleSnackbar(
        true,
        { labelName: error.message, labelCode: error.message },
        "error"
      )
    );
  }

};

export const getMISApplicationTypeReport = async data => {
  try {
    const response = await httpRequest(
      "post",
      "/report/pm-services/RevenueCollectionReportApplicationTypeWise/_get",
      "",
      [],
      data
    );
    //alert(JSON.stringify(response));
    return response;

  } catch (error) {
    store.dispatch(
      toggleSnackbar(
        true,
        { labelName: error.message, labelCode: error.message },
        "error"
      )
    );
  }

};

export const getMISSectorReport = async data => {
  try {
    const response = await httpRequest(
      "post",
      "/report/pm-services/RevenueCollectionReportSectorWise/_get",
      "",
      [],
      data
    );
    //alert(JSON.stringify(response));
    return response;

  } catch (error) {
    store.dispatch(
      toggleSnackbar(
        true,
        { labelName: error.message, labelCode: error.message },
        "error"
      )
    );
  }

};

export const getSectordata1 = async () => {
  let queryObject = [];
  var requestBody = {
    "applicationType": "PETNOC",
    "applicationStatus": "Create",
    "tenantId": getOPMSTenantId(),
    "auditDetails": {
      "createdBy": 1,
      "lastModifiedBy": 1,
      "createdTime": 1578894136873,
      "lastModifiedTime": 1578894136873
    },
    "MdmsCriteria": {
      "tenantId": getOPMSTenantId(),
      "moduleDetails": [
        {
          "moduleName": "egpm",
          "masterDetails": [
            {
              "name": "sector"
            }
          ]
        }
      ]
    }
  }
  try {
    const payload = await httpRequest(
      "post",
      "/egov-mdms-service/v1/_search",
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    store.dispatch(toggleSnackbar(true, error.message, "error"));
  }
};

export const getrepotforproccessingTime1 = async () => {
  let data = {
    "tenantId": getOPMSTenantId(),
    "reportName": "ApplicationProcessingTimeReport"
  }
  try {
    const response = await httpRequest(
      "post",
      "/report/pm-services/ApplicationProcessingTimeReport/_get",
      "",
      [],
      data
    );
    //alert(JSON.stringify(response));
    return response;

  } catch (error) {
    store.dispatch(
      toggleSnackbar(
        true,
        { labelName: error.message, labelCode: error.message },
        "error"
      )
    );
  }

};
export const getMonthwiseReport = async data => {
  try {
    const response = await httpRequest(
      "post",
      "/report/pm-services/RevenueCollectionReportMonthWise/_get",
      "",
      [],
      data
    );
    //alert(JSON.stringify(response));
    return response;

  } catch (error) {
    store.dispatch(
      toggleSnackbar(
        true,
        { labelName: error.message, labelCode: error.message },
        "error"
      )
    );
  }

};

export const getMonth1 = async () => {
  let queryObject = [];
  var requestBody = {

    "MdmsCriteria": {
      "tenantId": getOPMSTenantId(),
      "moduleDetails": [
        {
          "moduleName": "egpm",
          "masterDetails": [
            {
              "name": "reportMonth"
            }
          ]
        }
      ]
    }
  }
  try {
    const payload = await httpRequest(
      "post",
      "/egov-mdms-service/v1/_search",
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    store.dispatch(toggleSnackbar(true, error.message, "error"));
  }
};

export const getYear1 = async () => {
  let queryObject = [];
  var requestBody = {

    "MdmsCriteria": {
      "tenantId": getOPMSTenantId(),
      "moduleDetails": [
        {
          "moduleName": "egpm",
          "masterDetails": [
            {
              "name": "reportYear"
            }
          ]
        }
      ]
    }
  }
  try {
    const payload = await httpRequest(
      "post",
      "/egov-mdms-service/v1/_search",
      "",
      queryObject,
      requestBody
    );
    return payload;
  } catch (error) {
    store.dispatch(toggleSnackbar(true, error.message, "error"));
  }
};

export const callBackForRefund = async data => {
  const response = await getSearchResultsView([
    { key: "tenantId", value: data.tenantId },
    { key: "applicationNumber", value: data.applicationId }
  ]);
  let nocApplicationDetail = get(response, "nocApplicationDetail", []);
  try {
    let withdrawType = data.applicationStatus === "APPROVEFORWITHDRAW" ? "partialRefund" : "fullRefund";
    const response1 = await httpRequest(
      "post",
      "/pm-refund-services/v1/_refund",
      "",
      [{ key: "withdrawType", value: withdrawType }],
      { "RequestBody": nocApplicationDetail[0] }
    );

    return response1;

  } catch (error) {
    store.dispatch(
      toggleSnackbar(
        true,
        { labelName: error.message, labelCode: error.message },
        "error"
      )
    );
  }

};

export const UpdateStatus = async (dispatch, url, queryObject, code) => {
  try {
    const response = await httpRequest(
      "post", "/pm-services/noc/_updateappstatus", "", [], code
    );
    // return response;
    if (response.ResponseInfo.status == "success") {
      store.dispatch(
        toggleSnackbar(
          true,
          { labelName: 'Success', labelCode: 'Success' },
          "success"
        ));
      dispatch(setRoute(url))
      if (code.applicationStatus == "APPROVEFORWITHDRAW" || code.applicationStatus == "WITHDRAW") {
        callBackForRefund(code);
      }

    }
    else {
      dispatch(toggleSnackbar(true, response.ResponseInfo.msgId, "warning"));
      //dispatch(setRoute(url))

    }
  } catch (error) {
    store.dispatch(
      toggleSnackbar(
        true,
        { labelName: error.message, labelCode: error.message },
        "error"
      )
    );
  }
};