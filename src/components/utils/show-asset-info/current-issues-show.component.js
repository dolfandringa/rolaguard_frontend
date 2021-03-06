import React, { useState, useContext, useEffect } from "react";
import { MobXProviderContext } from "mobx-react";
import {
  Table,
  Label,
  Icon,
  Segment,
  Grid,
  Pagination,
  Popup,
  Container
} from "semantic-ui-react";
import Moment from "react-moment";
import AlertUtil from "../../../util/alert-util";
import _ from "lodash";
import EmptyComponent from "../../utils/empty.component";
import DetailsAlertModal from "../../../components/details.alert.modal.component";
import DateFilterBar from "./date-filter-bar.component";
import AssetId from "../asset-id.component";
import LoaderComponent from "../loader.component";

const ShowCurrentIssues = (props) => {
  const { commonStore, globalConfigStore } = useContext(MobXProviderContext);

  const [selectedAlert, setSelectedAlert] = useState({
    alert: {},
    alert_type: {},
  });

  const [currentIssues, setCurrentIssues] = useState({});
  const [activePage, setActivePage] = useState(1);
  const [perPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [orderBy, setOrderBy] = useState(["since", "DESC"]);
  const [dateFilter, setDateFilter] = useState({
    from: null,
    to: null,
  });
  const { type, id } = props;

  useEffect(() => {
    setIsLoading(true);
    const currentIssuePromise = commonStore.getData(
      "current_issues",
      {
        type: type,
        id: id,
      },

      {
        page: activePage,
        size: perPage,
        order_by: orderBy,
        "created_at[gte]": dateFilter.from,
        "created_at[lte]": dateFilter.to,
      }
    );
    Promise.all([currentIssuePromise]).then((response) => {
      setCurrentIssues(response[0].data.issues);
      setTotalItems(response[0].data.total_items);
      setTotalPages(response[0].data.total_pages);
      setIsLoading(false);
    });
  }, [type, id, activePage, perPage, orderBy, dateFilter]);

  const handlePaginationChange = (e, { activePage }) => {
    setActivePage(activePage);
  };

  const toggleSort = (field) => {
    setOrderBy([field, orderBy[1] === "ASC" ? "DESC" : "ASC"]);
  };

  const showAlertDetails = (data) => {
    setSelectedAlert({ alert: data.alert, alert_type: data.alert.type });
  };

  const closeAlertDetails = () => {
    setSelectedAlert({ alert: {}, alert_type: {} });
  };

  const handleDateFilterChange = (date) => {
    setDateFilter((prevDate) => {
      return { ...prevDate, ...date };
    });
  };
  const toggleShowFilter = () => {
    setShowFilters((actualShowFilter) => {
      return !actualShowFilter;
    });
  };
  return (
    <React.Fragment>
      <h5
        className="ui inverted top attached header"
        style={{ height: "44px", maxHeight: "44px" }}
      >
        CURRENT ISSUES
        {totalItems > 0 && <Label color="yellow">{totalItems}</Label>}
        <span className="pull-right aligned" onClick={toggleShowFilter}>
          <Popup
            size="tiny"
            trigger={<Icon name="filter" size="small" bordered link inverted />}
            basic
            content={showFilters ? "Hide Filters" : "ShowFilters"}
          />
        </span>
      </h5>
      <DateFilterBar
        showFilters={showFilters}
        onDateFilterChange={handleDateFilterChange}
      />

      <Segment attached style={{ height: "100%" }}>
        {isLoading && (
          <LoaderComponent loadingMessage="Loading current issues..." />
        )}
        {totalItems <= 0 && !isLoading && (
          <EmptyComponent emptyMessage="There are no current issues to show" />
        )}
        {totalItems > 0 && !isLoading && (
          <Container>
            <Table
              striped
              selectable
              className="animated fadeIn"
              basic="very"
              compact="very"
            >
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell collapsing>RISK</Table.HeaderCell>
                  <Table.HeaderCell>DESCRIPTION</Table.HeaderCell>
                  <Table.HeaderCell
                    collapsing
                    onClick={() => toggleSort("since")}
                    style={{ cursor: "pointer" }}
                  >
                    <Icon
                      name={`sort content ${
                        orderBy[1] === "ASC" ? "ascending" : "descending"
                      }`}
                      title={`toggle sort order content ${
                        orderBy[1] === "ASC" ? "descending" : "ascending"
                      }`}
                    />
                    DATE
                  </Table.HeaderCell>
                  <Table.HeaderCell collapsing>
                    LAST CHECK
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {currentIssues.map((current_issue, index) => {
                  return (
                    <Table.Row key={index} style={{ cursor: "pointer" }}>
                      <Table.Cell
                        onClick={() => showAlertDetails(current_issue)}
                      >
                        <Label
                          horizontal
                          style={{
                            backgroundColor: AlertUtil.getColorsMap()[
                              current_issue.alert.type.risk
                            ],
                            color: "white",
                            borderWidth: 1,
                            width: "100px",
                          }}
                        >
                          {current_issue.alert.type.risk}
                        </Label>
                      </Table.Cell>
                      <Table.Cell
                        onClick={() => showAlertDetails(current_issue)}
                      >
                        {current_issue.alert.type.name}
                      </Table.Cell>
                      <Table.Cell
                        singleLine
                        onClick={() => showAlertDetails(current_issue)}
                      
                      >
                        {
                          <Moment
                            format={
                              globalConfigStore.dateFormats.moment
                                .dateTimeFormat
                            }
                          >
                            {current_issue.since}
                          </Moment>
                        }
                      </Table.Cell>

                      <Table.Cell
                        singleLine
                        onClick={() => showAlertDetails(current_issue)}
                      >
                        {
                          <Moment
                            format={
                              globalConfigStore.dateFormats.moment
                                .dateTimeFormat
                            }
                          >
                            {current_issue.last_checked}
                          </Moment>
                        }
                      </Table.Cell>
                      {!_.isEmpty(selectedAlert.alert) && (
                        <DetailsAlertModal
                          loading={false}
                          alert={selectedAlert}
                          onClose={closeAlertDetails}
                        />
                      )}
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Container>
        )}
        {totalPages > 1 && (
          <Grid className="centered bottom">
            <Pagination
              size="mini"
              activePage={activePage}
              const
              onPageChange={handlePaginationChange}
              totalPages={totalPages}
            />
          </Grid>
        )}
      </Segment>
    </React.Fragment>
  );
};

export default ShowCurrentIssues;
