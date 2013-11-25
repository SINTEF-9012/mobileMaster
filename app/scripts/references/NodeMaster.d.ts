declare module NodeMaster {
	interface ProtoBufModel {
		toArrayBuffer(): ArrayBuffer;
		//toBuffer(): NodeBuffer;
		//encode(): ByteBuffer;
		toBase64(): string;
		toString(): string;
	}

	export interface ProtoBufBuilder {
		LatLng: LatLngBuilder;
		AgeModel: AgeModelBuilder;
		BloodPressureModel: BloodPressureModelBuilder;
		VitalSignsModel: VitalSignsModelBuilder;
		TriageInfoModel: TriageInfoModelBuilder;
		HelpBeaconModel: HelpBeaconModelBuilder;
		IncidentObjectModel: IncidentObjectModelBuilder;
		MediaModel: MediaModelBuilder;
		MessengerModel: MessengerModelBuilder;
		PatientModel: PatientModelBuilder;
		ResourceMobilizationModel: ResourceMobilizationModelBuilder;
		ResourceStatusModel: ResourceStatusModelBuilder;
		Transaction: TransactionBuilder;
		
	}
}

declare module NodeMaster {

	export interface LatLng extends ProtoBufModel {
		lat: number;
		getLat() : number;
		setLat(lat : number): void;
		lng: number;
		getLng() : number;
		setLng(lng : number): void;
		
	}
	
	export interface LatLngBuilder {
		new(): LatLng;
		decode(buffer: ArrayBuffer) : LatLng;
		//decode(buffer: NodeBuffer) : LatLng;
		//decode(buffer: ByteArrayBuffer) : LatLng;
		decode64(buffer: string) : LatLng;
		
	}	
}

declare module NodeMaster {

	export interface AgeModel extends ProtoBufModel {
		Value?: number;
		getValue() : number;
		setValue(value : number): void;
		Unit?: string;
		getUnit() : string;
		setUnit(unit : string): void;
		
	}
	
	export interface AgeModelBuilder {
		new(): AgeModel;
		decode(buffer: ArrayBuffer) : AgeModel;
		//decode(buffer: NodeBuffer) : AgeModel;
		//decode(buffer: ByteArrayBuffer) : AgeModel;
		decode64(buffer: string) : AgeModel;
		
	}	
}

declare module NodeMaster {

	export interface BloodPressureModel extends ProtoBufModel {
		SystolicBloodPressure?: number;
		getSystolicBloodPressure() : number;
		setSystolicBloodPressure(systolicBloodPressure : number): void;
		DiastolicBloodPressure?: number;
		getDiastolicBloodPressure() : number;
		setDiastolicBloodPressure(diastolicBloodPressure : number): void;
		
	}
	
	export interface BloodPressureModelBuilder {
		new(): BloodPressureModel;
		decode(buffer: ArrayBuffer) : BloodPressureModel;
		//decode(buffer: NodeBuffer) : BloodPressureModel;
		//decode(buffer: ByteArrayBuffer) : BloodPressureModel;
		decode64(buffer: string) : BloodPressureModel;
		
	}	
}

declare module NodeMaster {

	export interface VitalSignsModel extends ProtoBufModel {
		BloodPressure?: BloodPressureModel;
		getBloodPressure() : BloodPressureModel;
		setBloodPressure(bloodPressure : BloodPressureModel): void;
		PulseRate?: number;
		getPulseRate() : number;
		setPulseRate(pulseRate : number): void;
		RespiratoryRate?: number;
		getRespiratoryRate() : number;
		setRespiratoryRate(respiratoryRate : number): void;
		Temperature?: number;
		getTemperature() : number;
		setTemperature(temperature : number): void;
		DateTime?: number;
		getDateTime() : number;
		setDateTime(dateTime : number): void;
		
	}
	
	export interface VitalSignsModelBuilder {
		new(): VitalSignsModel;
		decode(buffer: ArrayBuffer) : VitalSignsModel;
		//decode(buffer: NodeBuffer) : VitalSignsModel;
		//decode(buffer: ByteArrayBuffer) : VitalSignsModel;
		decode64(buffer: string) : VitalSignsModel;
		
	}	
}

declare module NodeMaster {

	export interface TriageInfoModel extends ProtoBufModel {
		ReportProviderId?: string;
		getReportProviderId() : string;
		setReportProviderId(reportProviderId : string): void;
		ReportId?: string;
		getReportId() : string;
		setReportId(reportId : string): void;
		ReportDateTime?: number;
		getReportDateTime() : number;
		setReportDateTime(reportDateTime : number): void;
		
	}
	
	export interface TriageInfoModelBuilder {
		new(): TriageInfoModel;
		decode(buffer: ArrayBuffer) : TriageInfoModel;
		//decode(buffer: NodeBuffer) : TriageInfoModel;
		//decode(buffer: ByteArrayBuffer) : TriageInfoModel;
		decode64(buffer: string) : TriageInfoModel;
		
	}	
}

declare module NodeMaster {

	export interface HelpBeaconModel extends ProtoBufModel {
		ID: string;
		getID() : string;
		setID(iD : string): void;
		BasicID?: string;
		getBasicID() : string;
		setBasicID(basicID : string): void;
		Message?: string;
		getMessage() : string;
		setMessage(message : string): void;
		LastScanDateTime?: number;
		getLastScanDateTime() : number;
		setLastScanDateTime(lastScanDateTime : number): void;
		Notified?: boolean;
		getNotified() : boolean;
		setNotified(notified : boolean): void;
		Rescued?: boolean;
		getRescued() : boolean;
		setRescued(rescued : boolean): void;
		Safe?: boolean;
		getSafe() : boolean;
		setSafe(safe : boolean): void;
		AdvertisedDateTime?: number;
		getAdvertisedDateTime() : number;
		setAdvertisedDateTime(advertisedDateTime : number): void;
		Name?: string;
		getName() : string;
		setName(name : string): void;
		Imei?: string;
		getImei() : string;
		setImei(imei : string): void;
		Source?: string;
		getSource() : string;
		setSource(source : string): void;
		Time?: number;
		getTime() : number;
		setTime(time : number): void;
		Location?: LatLng;
		getLocation() : LatLng;
		setLocation(location : LatLng): void;
		DistributionDictionay: HelpBeaconModel.DictionaryEntry[];
		getDistributionDictionay() : HelpBeaconModel.DictionaryEntry[];
		setDistributionDictionay(distributionDictionay : HelpBeaconModel.DictionaryEntry[]): void;
		
	}
	
	export interface HelpBeaconModelBuilder {
		new(): HelpBeaconModel;
		decode(buffer: ArrayBuffer) : HelpBeaconModel;
		//decode(buffer: NodeBuffer) : HelpBeaconModel;
		//decode(buffer: ByteArrayBuffer) : HelpBeaconModel;
		decode64(buffer: string) : HelpBeaconModel;
		DictionaryEntry: HelpBeaconModel.DictionaryEntryBuilder;
		
	}	
}

declare module NodeMaster.HelpBeaconModel {

	export interface DictionaryEntry extends ProtoBufModel {
		key: string;
		getKey() : string;
		setKey(key : string): void;
		value: string;
		getValue() : string;
		setValue(value : string): void;
		
	}
	
	export interface DictionaryEntryBuilder {
		new(): DictionaryEntry;
		decode(buffer: ArrayBuffer) : DictionaryEntry;
		//decode(buffer: NodeBuffer) : DictionaryEntry;
		//decode(buffer: ByteArrayBuffer) : DictionaryEntry;
		decode64(buffer: string) : DictionaryEntry;
		
	}	
}

declare module NodeMaster {

	export interface IncidentObjectModel extends ProtoBufModel {
		ID: string;
		getID() : string;
		setID(iD : string): void;
		GraphicValue?: string;
		getGraphicValue() : string;
		setGraphicValue(graphicValue : string): void;
		Description?: string;
		getDescription() : string;
		setDescription(description : string): void;
		Floor?: number;
		getFloor() : number;
		setFloor(floor : number): void;
		Elevation?: number;
		getElevation() : number;
		setElevation(elevation : number): void;
		LinearRingPointList: LatLng[];
		getLinearRingPointList() : LatLng[];
		setLinearRingPointList(linearRingPointList : LatLng[]): void;
		Location?: LatLng;
		getLocation() : LatLng;
		setLocation(location : LatLng): void;
		
	}
	
	export interface IncidentObjectModelBuilder {
		new(): IncidentObjectModel;
		decode(buffer: ArrayBuffer) : IncidentObjectModel;
		//decode(buffer: NodeBuffer) : IncidentObjectModel;
		//decode(buffer: ByteArrayBuffer) : IncidentObjectModel;
		decode64(buffer: string) : IncidentObjectModel;
		
	}	
}

declare module NodeMaster {

	export interface MediaModel extends ProtoBufModel {
		ID: string;
		getID() : string;
		setID(iD : string): void;
		Title?: string;
		getTitle() : string;
		setTitle(title : string): void;
		AvailableDateTime?: number;
		getAvailableDateTime() : number;
		setAvailableDateTime(availableDateTime : number): void;
		Tags: string[];
		getTags() : string[];
		setTags(tags : string[]): void;
		LocalFileUriString?: string;
		getLocalFileUriString() : string;
		setLocalFileUriString(localFileUriString : string): void;
		UriString?: string;
		getUriString() : string;
		setUriString(uriString : string): void;
		Type?: number;
		getType() : number;
		setType(type : number): void;
		Location?: LatLng;
		getLocation() : LatLng;
		setLocation(location : LatLng): void;
		Description?: string;
		getDescription() : string;
		setDescription(description : string): void;
		Author?: string;
		getAuthor() : string;
		setAuthor(author : string): void;
		SubeventKeywords?: string;
		getSubeventKeywords() : string;
		setSubeventKeywords(subeventKeywords : string): void;
		GroupName?: string;
		getGroupName() : string;
		setGroupName(groupName : string): void;
		
	}
	
	export interface MediaModelBuilder {
		new(): MediaModel;
		decode(buffer: ArrayBuffer) : MediaModel;
		//decode(buffer: NodeBuffer) : MediaModel;
		//decode(buffer: ByteArrayBuffer) : MediaModel;
		decode64(buffer: string) : MediaModel;
		
	}	
}

declare module NodeMaster {

	export interface MessengerModel extends ProtoBufModel {
		ID: string;
		getID() : string;
		setID(iD : string): void;
		SenderID?: string;
		getSenderID() : string;
		setSenderID(senderID : string): void;
		ActionPlan?: string;
		getActionPlan() : string;
		setActionPlan(actionPlan : string): void;
		DateTimeSent?: number;
		getDateTimeSent() : number;
		setDateTimeSent(dateTimeSent : number): void;
		
	}
	
	export interface MessengerModelBuilder {
		new(): MessengerModel;
		decode(buffer: ArrayBuffer) : MessengerModel;
		//decode(buffer: NodeBuffer) : MessengerModel;
		//decode(buffer: ByteArrayBuffer) : MessengerModel;
		decode64(buffer: string) : MessengerModel;
		
	}	
}

declare module NodeMaster {

	export interface IPatientModel extends ProtoBufModel {
		ID: string;
		getID() : string;
		setID(iD : string): void;
		TriageInfo?: TriageInfoModel;
		getTriageInfo() : TriageInfoModel;
		setTriageInfo(triageInfo : TriageInfoModel): void;
		Age?: AgeModel;
		getAge() : AgeModel;
		setAge(age : AgeModel): void;
		Sex?: string;
		getSex() : string;
		setSex(sex : string): void;
		TriageStatus?: PatientModel.TriageStatusEnum;
		getTriageStatus() : PatientModel.TriageStatusEnum;
		setTriageStatus(triageStatus : PatientModel.TriageStatusEnum): void;
		IncidentId?: string;
		getIncidentId() : string;
		setIncidentId(incidentId : string): void;
		Location?: LatLng;
		getLocation() : LatLng;
		setLocation(location : LatLng): void;
		PersonalIdNumber?: string;
		getPersonalIdNumber() : string;
		setPersonalIdNumber(personalIdNumber : string): void;
		VitalSigns: VitalSignsModel[];
		getVitalSigns() : VitalSignsModel[];
		setVitalSigns(vitalSigns : VitalSignsModel[]): void;
		TransferredToDestination?: string;
		getTransferredToDestination() : string;
		setTransferredToDestination(transferredToDestination : string): void;
		Transporting?: boolean;
		getTransporting() : boolean;
		setTransporting(transporting : boolean): void;
		
	}
	
	export interface PatientModelBuilder {
		new(): IPatientModel;
		decode(buffer: ArrayBuffer) : IPatientModel;
		//decode(buffer: NodeBuffer) : PatientModel;
		//decode(buffer: ByteArrayBuffer) : PatientModel;
		decode64(buffer: string) : IPatientModel;
		TriageStatusEnum: PatientModel.TriageStatusEnum;
		
	}	
}

declare module NodeMaster.PatientModel {

	export enum TriageStatusEnum {
		RED = 1,
		YELLOW = 2,
		GREEN = 3,
		BLACK = 4,
		WHITE = 5,
		
	}
}

declare module NodeMaster {

	export interface ResourceMobilizationModel extends ProtoBufModel {
		ID: string;
		getID() : string;
		setID(iD : string): void;
		Location?: LatLng;
		getLocation() : LatLng;
		setLocation(location : LatLng): void;
		Task?: string;
		getTask() : string;
		setTask(task : string): void;
		NumberOfFireVehicles?: number;
		getNumberOfFireVehicles() : number;
		setNumberOfFireVehicles(numberOfFireVehicles : number): void;
		NumberOfFirePersonnel?: number;
		getNumberOfFirePersonnel() : number;
		setNumberOfFirePersonnel(numberOfFirePersonnel : number): void;
		NumberOfMedicVehicles?: number;
		getNumberOfMedicVehicles() : number;
		setNumberOfMedicVehicles(numberOfMedicVehicles : number): void;
		NumberOfMedicPersonnel?: number;
		getNumberOfMedicPersonnel() : number;
		setNumberOfMedicPersonnel(numberOfMedicPersonnel : number): void;
		NumberOfPoliceVehicles?: number;
		getNumberOfPoliceVehicles() : number;
		setNumberOfPoliceVehicles(numberOfPoliceVehicles : number): void;
		NumberOfPolicePersonnel?: number;
		getNumberOfPolicePersonnel() : number;
		setNumberOfPolicePersonnel(numberOfPolicePersonnel : number): void;
		
	}
	
	export interface ResourceMobilizationModelBuilder {
		new(): ResourceMobilizationModel;
		decode(buffer: ArrayBuffer) : ResourceMobilizationModel;
		//decode(buffer: NodeBuffer) : ResourceMobilizationModel;
		//decode(buffer: ByteArrayBuffer) : ResourceMobilizationModel;
		decode64(buffer: string) : ResourceMobilizationModel;
		
	}	
}

declare module NodeMaster {

	export interface ResourceStatusModel extends ProtoBufModel {
		ID: string;
		getID() : string;
		setID(iD : string): void;
		type?: string;
		getType() : string;
		setType(type : string): void;
		Assignment?: string;
		getAssignment() : string;
		setAssignment(assignment : string): void;
		Name?: string;
		getName() : string;
		setName(name : string): void;
		Status?: string;
		getStatus() : string;
		setStatus(status : string): void;
		Location?: LatLng;
		getLocation() : LatLng;
		setLocation(location : LatLng): void;
		
	}
	
	export interface ResourceStatusModelBuilder {
		new(): ResourceStatusModel;
		decode(buffer: ArrayBuffer) : ResourceStatusModel;
		//decode(buffer: NodeBuffer) : ResourceStatusModel;
		//decode(buffer: ByteArrayBuffer) : ResourceStatusModel;
		decode64(buffer: string) : ResourceStatusModel;
		
	}	
}

declare module NodeMaster {

	export interface Transaction extends ProtoBufModel {
		PublishList?: Transaction.Content;
		getPublishList() : Transaction.Content;
		setPublishList(publishList : Transaction.Content): void;
		RemoveList?: Transaction.Content;
		getRemoveList() : Transaction.Content;
		setRemoveList(removeList : Transaction.Content): void;
		SenderID: string;
		getSenderID() : string;
		setSenderID(senderID : string): void;
		
	}
	
	export interface TransactionBuilder {
		new(): Transaction;
		decode(buffer: ArrayBuffer) : Transaction;
		//decode(buffer: NodeBuffer) : Transaction;
		//decode(buffer: ByteArrayBuffer) : Transaction;
		decode64(buffer: string) : Transaction;
		Content: Transaction.ContentBuilder;
		
	}	
}

declare module NodeMaster.Transaction {

	export interface Content extends ProtoBufModel {
		HelpBeaconList: HelpBeaconModel[];
		getHelpBeaconList() : HelpBeaconModel[];
		setHelpBeaconList(helpBeaconList : HelpBeaconModel[]): void;
		IncidentObjectList: IncidentObjectModel[];
		getIncidentObjectList() : IncidentObjectModel[];
		setIncidentObjectList(incidentObjectList : IncidentObjectModel[]): void;
		MediaList: MediaModel[];
		getMediaList() : MediaModel[];
		setMediaList(mediaList : MediaModel[]): void;
		MessengerList: MessengerModel[];
		getMessengerList() : MessengerModel[];
		setMessengerList(messengerList : MessengerModel[]): void;
		PatientList: IPatientModel[];
		getPatientList() : IPatientModel[];
		setPatientList(patientList : IPatientModel[]): void;
		ResourceMobilizationList: ResourceMobilizationModel[];
		getResourceMobilizationList() : ResourceMobilizationModel[];
		setResourceMobilizationList(resourceMobilizationList : ResourceMobilizationModel[]): void;
		ResourceStatusList: ResourceStatusModel[];
		getResourceStatusList() : ResourceStatusModel[];
		setResourceStatusList(resourceStatusList : ResourceStatusModel[]): void;
		
	}
	
	export interface ContentBuilder {
		new(): Content;
		decode(buffer: ArrayBuffer) : Content;
		//decode(buffer: NodeBuffer) : Content;
		//decode(buffer: ByteArrayBuffer) : Content;
		decode64(buffer: string) : Content;
		
	}	
}

