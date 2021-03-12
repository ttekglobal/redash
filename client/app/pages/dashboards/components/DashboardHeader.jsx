import React from "react";
import cx from "classnames";
import PropTypes from "prop-types";
import { map, includes } from "lodash";
import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import EllipsisOutlinedIcon from "@ant-design/icons/EllipsisOutlined";
import Modal from "antd/lib/modal";
import Tooltip from "antd/lib/tooltip";
import FavoritesControl from "@/components/FavoritesControl";
import EditInPlace from "@/components/EditInPlace";
import { DashboardTagsControl } from "@/components/tags-control/TagsControl";
import getTags from "@/services/getTags";
import { clientConfig } from "@/services/auth";
import { policy } from "@/services/policy";
import { durationHumanize } from "@/lib/utils";
import { DashboardStatusEnum } from "../hooks/useDashboard";

import "./DashboardHeader.less";

let backDashboard = localStorage.getItem("b_dashboard");
backDashboard = backDashboard ? JSON.parse(backDashboard) : "";
const showBackButton = backDashboard.pathname === window.location.pathname && backDashboard.link ? true : false;

function getDashboardTags() {
  return getTags("api/dashboards/tags").then(tags => map(tags, t => t.name));
}

function buttonType(value) {
  return value ? "primary" : "default";
}

function DashboardPageTitle({ dashboardConfiguration }) {
  const { dashboard, canEditDashboard, updateDashboard, editingLayout } = dashboardConfiguration;
  return (
    <div className="title-with-tags">
      <div className="page-title">
        <FavoritesControl item={dashboard} />
        <h3>
          <EditInPlace
            isEditable={editingLayout}
            onDone={name => updateDashboard({ name })}
            value={dashboard.name}
            ignoreBlanks
          />
        </h3>
        <Tooltip title={dashboard.user.name} placement="bottom">
          <img src={dashboard.user.profile_image_url} className="profile-image" alt={dashboard.user.name} />
        </Tooltip>
      </div>
      <DashboardTagsControl
        tags={dashboard.tags}
        isDraft={dashboard.is_draft}
        isArchived={dashboard.is_archived}
        canEdit={canEditDashboard}
        getAvailableTags={getDashboardTags}
        onEdit={tags => updateDashboard({ tags })}
      />
    </div>
  );
}

DashboardPageTitle.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

function RefreshButton({ dashboardConfiguration }) {
  const { refreshRate, setRefreshRate, disableRefreshRate, refreshing, refreshDashboard } = dashboardConfiguration;
  const allowedIntervals = policy.getDashboardRefreshIntervals();
  const refreshRateOptions = clientConfig.dashboardRefreshIntervals;
  const onRefreshRateSelected = ({ key }) => {
    const parsedRefreshRate = parseFloat(key);
    if (parsedRefreshRate) {
      setRefreshRate(parsedRefreshRate);
      refreshDashboard();
    } else {
      disableRefreshRate();
    }
  };
  return (
    <Button.Group>
      <Tooltip title={refreshRate ? `Auto Refreshing every ${durationHumanize(refreshRate)}` : null}>
        <Button type={buttonType(refreshRate)} onClick={() => refreshDashboard()}>
          <i className={cx("zmdi zmdi-refresh m-r-5", { "zmdi-hc-spin": refreshing })} />
          {refreshRate ? durationHumanize(refreshRate) : "Refresh"}
        </Button>
      </Tooltip>
      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        overlay={
          <Menu onClick={onRefreshRateSelected} selectedKeys={[`${refreshRate}`]}>
            {refreshRateOptions.map(option => (
              <Menu.Item key={`${option}`} disabled={!includes(allowedIntervals, option)}>
                {durationHumanize(option)}
              </Menu.Item>
            ))}
            {refreshRate && <Menu.Item key={null}>Disable auto refresh</Menu.Item>}
          </Menu>
        }>
        <Button className="icon-button hidden-xs" type={buttonType(refreshRate)}>
          <i className="fa fa-angle-down" />
          <span className="sr-only">Split button!</span>
        </Button>
      </Dropdown>
    </Button.Group>
  );
}

RefreshButton.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

function DashboardMoreOptionsButton({ dashboardConfiguration }) {
  const {
    dashboard,
    setEditingLayout,
    togglePublished,
    archiveDashboard,
    managePermissions,
    gridDisabled,
    isDashboardOwnerOrAdmin,
  } = dashboardConfiguration;

  const archive = () => {
    Modal.confirm({
      title: "Archive Dashboard",
      content: `Are you sure you want to archive the "${dashboard.name}" dashboard?`,
      okText: "Archive",
      okType: "danger",
      onOk: archiveDashboard,
      maskClosable: true,
      autoFocusButton: null,
    });
  };

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      overlay={
        <Menu data-test="DashboardMoreButtonMenu">
          <Menu.Item className={cx({ hidden: gridDisabled })}>
            <a onClick={() => setEditingLayout(true)}>Edit</a>
          </Menu.Item>
          {clientConfig.showPermissionsControl && isDashboardOwnerOrAdmin && (
            <Menu.Item>
              <a onClick={managePermissions}>Manage Permissions</a>
            </Menu.Item>
          )}
          {!clientConfig.disablePublish && !dashboard.is_draft && (
            <Menu.Item>
              <a onClick={togglePublished}>Unpublish</a>
            </Menu.Item>
          )}
          <Menu.Item>
            <a onClick={archive}>Archive</a>
          </Menu.Item>
        </Menu>
      }>
      <Button className="icon-button m-l-5" data-test="DashboardMoreButton">
        <EllipsisOutlinedIcon rotate={90} />
      </Button>
    </Dropdown>
  );
}

DashboardMoreOptionsButton.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

function back() {
  // console.log(backDashboard);
  const link = `${backDashboard.link}${backDashboard.link.indexOf("?") > -1 ? "&" : "?"}back=1`;
  window.location.href = link;
  localStorage.removeItem("b_dashboard");
}

function DashboardControl({ dashboardConfiguration, headerExtra }) {
  const {
    dashboard,
    togglePublished,
    canEditDashboard,
    fullscreen,
    toggleFullscreen,
    showShareDashboardDialog,
  } = dashboardConfiguration;
  const showPublishButton = dashboard.is_draft;
  const showRefreshButton = true;
  const showFullscreenButton = !dashboard.is_draft;
  const canShareDashboard = canEditDashboard && !dashboard.is_draft;
  const showShareButton = !clientConfig.disablePublicUrls && (dashboard.publicAccessEnabled || canShareDashboard);
  const showMoreOptionsButton = canEditDashboard;
  return (
    <div className="dashboard-control">
      {!dashboard.is_archived && (
        <span className="hidden-print">
          {showBackButton && (
            <Button className="m-r-5 hidden-xs" title={backDashboard.parentName} onClick={back}>
              <div className="back">{backDashboard.parentName}</div>
            </Button>
          )}
          {showPublishButton && (
            <Button className="m-r-5 hidden-xs" onClick={togglePublished}>
              <span className="fa fa-paper-plane m-r-5" /> Publish
            </Button>
          )}
          {showRefreshButton && <RefreshButton dashboardConfiguration={dashboardConfiguration} />}
          {showFullscreenButton && (
            <Tooltip className="hidden-xs" title="Enable/Disable Fullscreen display">
              <Button type={buttonType(fullscreen)} className="icon-button m-l-5" onClick={toggleFullscreen}>
                <i className="zmdi zmdi-fullscreen" />
              </Button>
            </Tooltip>
          )}
          {headerExtra}
          {showShareButton && (
            <Tooltip title="Dashboard Sharing Options">
              <Button
                className="icon-button m-l-5"
                type={buttonType(dashboard.publicAccessEnabled)}
                onClick={showShareDashboardDialog}
                data-test="OpenShareForm">
                <i className="zmdi zmdi-share" />
              </Button>
            </Tooltip>
          )}
          {showMoreOptionsButton && <DashboardMoreOptionsButton dashboardConfiguration={dashboardConfiguration} />}
        </span>
      )}
    </div>
  );
}

DashboardControl.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  headerExtra: PropTypes.node,
};

function DashboardEditControl({ dashboardConfiguration, headerExtra }) {
  const {
    setEditingLayout,
    doneBtnClickedWhileSaving,
    dashboardStatus,
    retrySaveDashboardLayout,
  } = dashboardConfiguration;
  let status;
  if (dashboardStatus === DashboardStatusEnum.SAVED) {
    status = <span className="save-status">Saved</span>;
  } else if (dashboardStatus === DashboardStatusEnum.SAVING) {
    status = (
      <span className="save-status" data-saving>
        Saving
      </span>
    );
  } else {
    status = (
      <span className="save-status" data-error>
        Saving Failed
      </span>
    );
  }
  return (
    <div className="dashboard-control">
      {status}
      {dashboardStatus === DashboardStatusEnum.SAVING_FAILED ? (
        <Button type="primary" onClick={retrySaveDashboardLayout}>
          Retry
        </Button>
      ) : (
        <Button loading={doneBtnClickedWhileSaving} type="primary" onClick={() => setEditingLayout(false)}>
          {!doneBtnClickedWhileSaving && <i className="fa fa-check m-r-5" />} Done Editing
        </Button>
      )}
      {headerExtra}
    </div>
  );
}

DashboardEditControl.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  headerExtra: PropTypes.node,
};

export default function DashboardHeader({ dashboardConfiguration, headerExtra }) {
  const { editingLayout } = dashboardConfiguration;
  const DashboardControlComponent = editingLayout ? DashboardEditControl : DashboardControl;

  return (
    <div className="dashboard-header">
      <DashboardPageTitle dashboardConfiguration={dashboardConfiguration} />
      <DashboardControlComponent dashboardConfiguration={dashboardConfiguration} headerExtra={headerExtra} />
    </div>
  );
}

DashboardHeader.propTypes = {
  dashboardConfiguration: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  headerExtra: PropTypes.node,
};
