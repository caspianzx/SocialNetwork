import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map(alert => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

//This declares and define what kind of props goes into Alert component
//helps to catch bug and validate data types
//array is required as initial state for alert is and empty array
Alert.propTypes = {
  alerts: PropTypes.array.isRequired
};

//Function as a props which will be passed into connect()
//Note: This define which state variable is accessible this component
//This pattern enhance predictability and result in explicit changes
const mapStateToProps = state => ({
  //state.alert comes from the alert reducer in rootReducer
  //state refers to rootReducer
  alerts: state.alert
});

//actual props gets pass in via connect func into Alert component
export default connect(mapStateToProps)(Alert);
