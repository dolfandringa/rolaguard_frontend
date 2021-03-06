import React, { useState, useEffect, useContext } from "react";
import { MobXProviderContext } from "mobx-react";
import { Icon, Grid, Segment, Popup } from "semantic-ui-react";
import ShowAlerts from "./alerts-show.component";
import ShowResourceUsage from "./resource-usage/resource-usage-show.component";
import ShowInventory from "./inventory-show.component";
import { CopyToClipboard } from "react-copy-to-clipboard";
import LoaderComponent from "../loader.component";
import AlertTimeLineGraph from "./alert-timeline-graph.component";
import ResourceUsageInfo from "./resource-usage/resource-usage-info.component";
import AssociatedAssetInventoryShow from "../../utils/show-asset-info/associated-asset-inventory-show.component";
import NotFoundPage from "../../../pages/notFoundPage.page"
import _ from "lodash";
import * as HttpStatus from "http-status-codes";

const ShowAssetInfo = (props) => {
  const [inventory, setInventory] = useState({});
  const [resource_usage, setResourceUsage] = useState({});
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOnRequest, setErrorOnRequest] = useState(true);
  const [statusResponse, setStatusResponse] = useState({isError: false, status: null, message: null});
  const { commonStore } = useContext(MobXProviderContext);

  const normalizedType =
    _.get(props, "type") &&
    !["gateway", "device"].includes(props.type.toLowerCase().trim())
      ? ""
      : props.type.toLowerCase().trim();

  const isDevice = normalizedType === "device";

  useEffect(() => {
    if (props.type && props.id) {
      let paramsId = {
        type: props.type,
        id: props.id,
      };

      const resourceUsagePromise = commonStore.getData(
        "resource_usage",
        paramsId
      );
      const inventoryPromise = commonStore.getData("inventory", paramsId)

      Promise.all([inventoryPromise, resourceUsagePromise])
        .then((response) => {          
          if (response[0].status === HttpStatus.OK) {
            setInventory(response[0].data);
            setResourceUsage(response[1].data);
            setIsLoading(false);
            setErrorOnRequest(false);
          } else {
            setInventory([]);
            setResourceUsage([]);
            setIsLoading(false);
            setErrorOnRequest(true);
          }
        })
        .catch((resp) => {
          setStatusResponse({isError: resp.isAxiosError, status: _.get(resp, 'response.status'), message: _.get(resp ,'response.data.message')});
          setInventory([]);          
          setResourceUsage([]);
          setIsLoading(false);
          setErrorOnRequest(true);
        });
    }
  }, [props.id, props.type]);
  if (isLoading) {
    return <LoaderComponent loadingMessage="Loading device info..." />;
  } else if (errorOnRequest && _.get(statusResponse, 'isError')) {
    return (
      <NotFoundPage
        status={statusResponse.status}
        statusText={statusResponse.message}
      />
    );
  } else {
    return (
      <React.Fragment>
        <Grid columns="equal" style={{ marginTop: "1em" }}>
          <ShowInventory
            inventory={inventory}
            LayoutHeaderRight={
              <div className="pull-right">
                <span
                  style={{
                    color: "white",
                    fontStyle: "italic",
                    fontSize: "12px",
                  }}
                >
                  {copied ? "copied to clipboard... " : ""}
                </span>
                <Popup
                  basic
                  trigger={
                    <CopyToClipboard
                      text={window.location.href}
                      onCopy={() => setCopied(true)}
                    >
                      <Icon
                        name="external share"
                        inverted
                        style={{ cursor: "pointer" }}
                      />
                    </CopyToClipboard>
                  }
                  content="Press here to copy the link to clipboard for sharing"
                />
              </div>
            }
          />
        </Grid>

        <Grid columns="equal">
          <Grid.Row>
            
            <Grid.Column mobile={16}
            tablet={16}
            computer={8} className="flex">
              <AlertTimeLineGraph type={props.type} id={props.id} />
            </Grid.Column>
            <Grid.Column mobile={16}
            tablet={16}
            computer={8} className="stretched flex">
              {props.type && props.id && (
                <ShowAlerts type={props.type} id={props.id} />
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid columns="equal">
          <Grid.Row>
            {isDevice && (
              <Grid.Column className="flex" columns={16}>
                <h5
                  className="ui inverted top attached header segment"
                  style={{ height: "44px" }}
                >
                  NETWORK OVERVIEW
                </h5>
                <Segment attached>
                  <ShowResourceUsage asset={resource_usage} />
                </Segment>
              </Grid.Column>
            )}
            {!isDevice && (
              <React.Fragment>
                <Grid.Column width={5}>
                  <h5
                    className="ui inverted top attached header segment"
                    style={{ height: "44px" }}
                  >
                    NETWORK OVERVIEW
                  </h5>
                  <Segment attached>
                    <ResourceUsageInfo asset={resource_usage} />
                  </Segment>
                </Grid.Column>
                <Grid.Column width={11}>
                  <AssociatedAssetInventoryShow
                    type={normalizedType}
                    id={props.id}
                  />
                </Grid.Column>
              </React.Fragment>
            )}
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
};

export default ShowAssetInfo
