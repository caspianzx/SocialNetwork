import axios from 'axios';
import { setAlert } from './alert';
import {
	GET_PROFILE,
	PROFILE_ERROR,
	UPDATE_PROFILE,
	ACCOUNT_DELETED,
	CLEAR_PROFILE,
	GET_PROFILES,
	GET_REPOS
} from './types';

//Get current user profile

export const getCurrentProfile = () => async (dispatch) => {
	try {
		const res = await axios.get('/api/profile/me');
		dispatch({
			type: GET_PROFILE,
			payload: res.data
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		});
	}
};

//Get all profile
export const getProfiles = () => async (dispatch) => {
	dispatch({
		type: CLEAR_PROFILE
	});
	try {
		const res = await axios.get('/api/profile');
		dispatch({
			type: GET_PROFILES,
			payload: res.data
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		});
	}
};

//Get all Github repos
export const getGithubRepos = (username) => async (dispatch) => {
	try {
		const res = await axios.get(`/api/profile/github/${username}`);
		dispatch({
			type: GET_REPOS,
			payload: res.data
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		});
	}
};

//Get profile by ID
export const getProfileByID = (userID) => async (dispatch) => {
	try {
		const res = await axios.get(`/api/profile/${userID}`);
		dispatch({
			type: GET_PROFILE,
			payload: res.data
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		});
	}
};

//Create or update a profile
export const createProfile = (formData, history, edit = false) => async (dispatch) => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			}
		};

		const res = await axios.post('/api/profile', formData, config);
		dispatch({
			type: GET_PROFILE,
			payload: res.data
		});

		dispatch(setAlert(edit ? 'Profile Update' : 'Profile Created', 'success'));

		if (!edit) {
			history.push('/dashboard');
		}
	} catch (err) {
		const errors = err.response.data.errors;
		if (errors) {
			//errors is an array
			//dispatch setAlert to indicate error
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		});
	}
};

//Add experience
export const addExperience = (formData, history) => async (dispatch) => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			}
		};

		const res = await axios.put('/api/profile/experience', formData, config);
		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data
		});

		dispatch(setAlert('Experience Added', 'success'));

		history.push('/dashboard');
	} catch (err) {
		const errors = err.response.data.errors;
		if (errors) {
			//errors is an array
			//dispatch setAlert to indicate error
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		});
	}
};

//Add education
export const addEducation = (formData, history) => async (dispatch) => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json'
			}
		};

		const res = await axios.put('/api/profile/education', formData, config);
		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data
		});

		dispatch(setAlert('Education Added', 'success'));

		history.push('/dashboard');
	} catch (err) {
		const errors = err.response.data.errors;
		if (errors) {
			//errors is an array
			//dispatch setAlert to indicate error
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		});
	}
};

//Delete experience

export const deleteExperience = (id) => async (dispatch) => {
	try {
		const res = await axios.delete(`/api/profile/experience/${id}`);
		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data
		});

		dispatch(setAlert('Experience Deleted', 'success'));
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		});
	}
};

//Delete education

export const deleteEducation = (id) => async (dispatch) => {
	try {
		const res = await axios.delete(`/api/profile/education/${id}`);
		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data
		});

		dispatch(setAlert('Education Deleted', 'success'));
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.statusText,
				status: err.response.status
			}
		});
	}
};

//Delete Account and Profile

export const deleteAccount = () => async (dispatch) => {
	if (window.confirm('Are you sure? This CANNOT be undone.')) {
		try {
			const res = await axios.delete(`/api/profile`);
			dispatch({
				type: CLEAR_PROFILE
			});
			dispatch({
				type: ACCOUNT_DELETED
			});

			dispatch(setAlert('Your account has been permanently deleted.'));
		} catch (err) {
			dispatch({
				type: PROFILE_ERROR,
				payload: {
					msg: err.response.statusText,
					status: err.response.status
				}
			});
		}
	}
};
