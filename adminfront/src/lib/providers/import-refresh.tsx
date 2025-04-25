// @ts-nocheck
'use client';
import React, { PropsWithChildren, useEffect } from 'react';
import { adminProductKeys } from 'medusa-react';
import { notification } from 'antd';

import { usePolling } from './polling-provider';
import { queryClient } from '../constants/query-client';

let lastDisplayedNotificationAt = Date.now();

/**
 * Provider for refreshing product/pricing lists after batch jobs are complete
 */
export const ImportRefresh = ({ children }: PropsWithChildren) => {
	const { batchJobs } = usePolling();

	useEffect(() => {
		if (!batchJobs) {
			return;
		}

		const productListQuery = Object.entries(
			queryClient.getQueryCache().queriesMap
		).find(([k, v]) => k.includes('admin_products'))?.[1];

		if (productListQuery) {
			const refreshedTimestamp = productListQuery.state.dataUpdatedAt;

			const completedJobs = batchJobs.filter(
				(job) => job.status === 'completed'
			);

			for (const job of completedJobs) {
				const jobCompletedTimestamp = new Date(job.completed_at).getTime();

				if (jobCompletedTimestamp > lastDisplayedNotificationAt) {
					notification.success({
						description: _.capitalize(
							`Hoàn thành tác vụ ${job.type.split('-').join(' ')}`
						),
					});

					lastDisplayedNotificationAt = Date.now();
				}

				if (
					job.type === 'product-import' &&
					jobCompletedTimestamp > refreshedTimestamp
				) {
					queryClient.invalidateQueries(adminProductKeys.all);
				}
			}
		}
	}, [batchJobs]);

	return <>{children}</>;
};
