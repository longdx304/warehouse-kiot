export type TResponse<T> = {
	data: T[];
	count: number;
	offset: number;
	limit: number;
};

export type FormImage = {
	id: string;
  url: string;
  name?: string;
  size?: number;
  nativeFile?: File;
	selected?: boolean;
}

export type MetadataField = {
  key: string
  value: string
  state?: "existing" | "new"
}

export type MetadataFormType = {
  entries: MetadataField[]
  deleted?: string[]
  ignored?: Record<string, any>
}

export declare class DateComparisonOperator {
	/**
	 * The filtered date must be less than this value.
	 */
	lt?: Date;
	/**
	 * The filtered date must be greater than this value.
	 */
	gt?: Date;
	/**
	 * The filtered date must be greater than or equal to this value.
	 */
	gte?: Date;
	/**
	 * The filtered date must be less than or equal to this value.
	 */
	lte?: Date;
}
