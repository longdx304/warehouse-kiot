'use client';

import React, { FC, useState } from 'react';
import { Card } from '@/components/Card';
import { Empty } from '@/components/Empty';
import { Button } from '@/components/Button';
import { message } from 'antd';

type Props = {};

type Location = {
	latitude: number;
	longitude: number;
	address?: string;
};

const DashboardTemplate: FC<Props> = ({}) => {
	const [location, setLocation] = useState<Location | null>(null);
	const [loading, setLoading] = useState(false);

	const getGPSLocation = () => {
		setLoading(true);
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const newLocation = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					};
					setLocation(newLocation);
					getAddressFromCoords(newLocation);
				},
				(error) => {
					console.error('Error getting location:', error.message);
					message.error(error.message);
					setLoading(false);
				}
			);
		} else {
			message.error('Geolocation is not supported by this browser.');
			setLoading(false);
		}
	};

	const getAddressFromCoords = async (coords: {
		latitude: number;
		longitude: number;
	}) => {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
			);
			const data = await response.json();
			if (data.display_name) {
				setLocation((prev) => ({ ...prev!, address: data.display_name }));
			} else {
				message.warning('Unable to get address for this location');
			}
		} catch (error) {
			console.error('Error getting address:', error);
			message.error('Failed to get address');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full" bordered={false}>
			<h1>Trang chủ</h1>
			<Button onClick={getGPSLocation} loading={loading}>
				Get GPS Location
			</Button>
			{location ? (
				<div>
					<p>
						Your location: Latitude {location.latitude}, Longitude{' '}
						{location.longitude}
					</p>
					{location.address && <p>Address: {location.address}</p>}
				</div>
			) : (
				<Empty description={false} className="pt-20" />
			)}
		</Card>
	);
};

export default DashboardTemplate;
