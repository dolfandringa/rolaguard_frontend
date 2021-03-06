import React, { useState, useContext, useEffect } from "react";
import { MobXProviderContext } from "mobx-react";
import LoaderComponent from "../loader.component";
import AssetId from "../asset-id.component";
import _ from "lodash";

const AssociatedAsset = (props) => {
  /*
   * This comonent list the associated assets for specific type, id combination.
   *
   * If the asset is a device, show the gateways connected to
   * If the asset is a gateway, show the devices connected to
   *
   * @param props
   */

  const [isLoading, setIsLoading] = useState(true);
  const [associatedAssets, setAssociatedAssets] = useState([]);
  const [qtyAssociated, setQtyAssociated] = useState(0);

  const { resourceUsageStore } = useContext(MobXProviderContext);
  useEffect(() => {
    setIsLoading(true);

    if (props.type && props.id) {
      const resourceUsagePromise = resourceUsageStore.getAssociatedAssets({
        type: props.type,
        id: props.id,
        size: 100,
      });
      Promise.all([resourceUsagePromise]).then((response) => {
        setAssociatedAssets(_.get(response, "[0].data.assets"));
        setQtyAssociated(_.get(response, "[0].data.assets").length);
        setIsLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (_.isFunction(props.onChange)) {
      props.onChange(qtyAssociated);
    }
  }, [qtyAssociated]);

  return (
    <React.Fragment>
      {isLoading && (
        <LoaderComponent loadingMessage="Loading associated assets" />
      )}
      {!isLoading &&
        associatedAssets.map((e) => {
          return (
            <React.Fragment key={e.id}>
              <AssetId
                type={e.type}
                hexId={e.hex_id}
                id={e.id}
                showAsLink={true}
              />
              <span>&nbsp;&nbsp;</span>
            </React.Fragment>
          );
        })}
    </React.Fragment>
  );
};

export default AssociatedAsset;
