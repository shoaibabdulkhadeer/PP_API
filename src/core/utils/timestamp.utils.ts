const unix_ts_now = () => {
	return Math.floor(+new Date() / 1000);
};

export { unix_ts_now };
