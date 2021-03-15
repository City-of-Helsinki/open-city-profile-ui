import {
  Language,
  ProfileRoot,
  ProfileData,
  VerifiedPersonalInformation,
  Addresses,
  AddressEdge,
  AddressNode,
  Emails,
  EmailEdge,
  EmailNode,
  Phones,
  PhoneEdge,
  PhoneNode,
  AddressType,
  EmailType,
  PhoneType,
  InsertableEdge,
  InsertableNode,
  EdgeList,
  MutableAddresses,
  MutableEmails,
  MutablePhones,
} from '../../graphql/typings';
import {
  createNewProfileData,
  EditData,
  Mutable,
} from '../../profile/helpers/mutationEditor';

export const getMyProfile = (): ProfileRoot => ({
  myProfile: {
    id: 'asd',
    firstName: 'Teemu',
    lastName: 'Testaaja',
    nickname: 'Teme',
    language: Language.FINNISH,
    primaryEmail: {
      email: 'ensimmainen@testi.fi',
      emailType: EmailType.OTHER,
      id: '123',
      primary: true,
      __typename: 'EmailNode',
    },
    primaryAddress: {
      id: '123',
      primary: true,
      address: 'Testikatu 55',
      city: 'Helsinki',
      countryCode: 'FI',
      postalCode: '00100',
      addressType: AddressType.OTHER,
      __typename: 'AddressNode',
    },
    primaryPhone: {
      id: '123',
      phone: '0501234567',
      phoneType: PhoneType.OTHER,
      primary: true,
      __typename: 'PhoneNode',
    },
    addresses: {
      edges: [
        {
          node: {
            id: '234',
            address: 'Muokkauskatu 55',
            city: 'Helsinki',
            countryCode: 'FI',
            postalCode: '12345',
            primary: false,
            addressType: AddressType.OTHER,
            __typename: 'AddressNode',
          },
          __typename: 'AddressNodeEdge',
        },
      ],
      __typename: 'AddressNodeConnection',
    },
    emails: {
      edges: [
        {
          node: {
            id: '234',
            email: 'test@email.com',
            primary: false,
            emailType: EmailType.OTHER,
            __typename: 'EmailNode',
          },
          __typename: 'EmailNodeEdge',
        },
      ],
      __typename: 'EmailNodeConnection',
    },
    phones: {
      edges: [
        {
          node: {
            id: '234',
            phone: '0501234567',
            phoneType: PhoneType.OTHER,
            primary: false,
            __typename: 'PhoneNode',
          },
          __typename: 'PhoneNodeEdge',
        },
      ],
      __typename: 'PhoneNodeConnection',
    },
    verifiedPersonalInformation: null,
    __typename: 'ProfileWithVerifiedPersonalInformationNode',
  },
});

export const getVerifiedData = (
  overrides?: Partial<VerifiedPersonalInformation>
): VerifiedPersonalInformation => ({
  __typename: 'VerifiedPersonalInformationNode',
  firstName: 'verifiedFirstName',
  lastName: 'verifiedLastName',
  givenName: 'verifiedGivenName',
  nationalIdentificationNumber: 'nationalIdentificationNumber',
  email: 'vip@email.com',
  municipalityOfResidence: 'municipalityOfResidence',
  municipalityOfResidenceNumber: 'municipalityOfResidenceNumber',
  permanentAddress: {
    __typename: 'VerifiedPersonalInformationAddressNode',
    streetAddress: 'permanent.streetAddress',
    postalCode: 'permanent.postalCode',
    postOffice: 'permanent.postOffice',
  },
  temporaryAddress: {
    __typename: 'VerifiedPersonalInformationAddressNode',
    streetAddress: 'temporaryAddress.streetAddress',
    postalCode: 'temporaryAddress.postalCode',
    postOffice: 'temporaryAddress.postOffice',
  },
  permanentForeignAddress: {
    __typename: 'VerifiedPersonalInformationForeignAddressNode',
    streetAddress: 'permanentForeignAddress.streetAddress',
    additionalAddress: 'permanentForeignAddress.additionalAddress',
    countryCode: 'permanentForeignAddress.countryCode',
  },
  ...overrides,
});

/* GENERIC FUNCS */

const getAddresses = (profile?: ProfileData): Addresses => {
  const source = profile || (getMyProfile().myProfile as ProfileData);
  return source.addresses as Addresses;
};
const getEmails = (profile?: ProfileData): Emails => {
  const source = profile || (getMyProfile().myProfile as ProfileData);
  return source.emails as Emails;
};
const getPhones = (profile?: ProfileData): Phones => {
  const source = profile || (getMyProfile().myProfile as ProfileData);
  return source.phones as Phones;
};

let idCounter = 1;
// eslint-disable-next-line no-plusplus
export const createId = (): string => `fake_id_${idCounter++}`;

export const cloneObject = <T>(source: T): T =>
  JSON.parse(JSON.stringify(source));

export const createEdgeArray = <T>(__typename: string): T => {
  const clone: unknown = {
    edges: [],
    __typename,
  };
  return clone as T;
};

export const createNewEdgeWithData = (
  edge: InsertableEdge,
  newValues: Partial<EditData['profileData']>
): Mutable<InsertableEdge> => {
  const node = edge.node;
  Object.assign(node, newValues);
  return edge;
};

export const updateEdgesNode = (
  node: InsertableNode,
  newValues: Partial<EditData['profileData']>
): InsertableNode => {
  Object.assign(node as Mutable<AddressNode>, newValues);
  return node;
};

export const findAndUpdateEdgesNode = (
  edges: Mutable<InsertableEdge>[],
  id: string,
  newValues: Partial<EditData['profileData']>
): InsertableNode => {
  const target = edges.find(edge => edge?.node?.id === id);
  if (!target || !target.node) {
    throw new Error(
      `findAndUpdateAddressEdgesNode: Node not found with id ${id}`
    );
  }
  return updateEdgesNode(target.node, newValues);
};

export const addNodeToEdges = (
  edges: Mutable<InsertableEdge>[],
  newNodes: InsertableEdge[],
  index?: number
): Mutable<InsertableEdge>[] => {
  const insertTo = typeof index === 'number' ? index : edges.length;
  edges.splice(insertTo, 0, ...newNodes);
  return edges;
};

export const removeNodeFromEdges = (
  edges: Mutable<InsertableEdge>[],
  id: string
): boolean => {
  const index = edges.findIndex(edge => edge?.node?.id === id);
  if (index > -1) {
    edges.splice(index, 1);
    return true;
  }
  return false;
};

export const getPrimaryNode = (
  profile: ProfileData,
  dataType: EditData['dataType']
): InsertableNode | null => {
  if (dataType === 'addresses') {
    return profile.primaryAddress;
  }
  if (dataType === 'emails') {
    return profile.primaryEmail;
  }
  if (dataType === 'phones') {
    return profile.primaryPhone;
  }
  return null;
};

export const setPrimaryNode = (
  profile: Mutable<ProfileData>,
  dataType: EditData['dataType'],
  newPrimary: InsertableNode | null
): void => {
  if (dataType === 'addresses') {
    profile.primaryAddress = newPrimary as AddressNode;
  }
  if (dataType === 'emails') {
    profile.primaryEmail = newPrimary as EmailNode;
  }
  if (dataType === 'phones') {
    profile.primaryPhone = newPrimary as PhoneNode;
  }
};

export const removePrimaryIfIdMatch = (
  profile: ProfileData,
  id: string,
  dataType: EditData['dataType']
): boolean => {
  const primary = getPrimaryNode(profile, dataType);

  if (primary && primary.id === id) {
    setPrimaryNode(profile, dataType, null);
    return true;
  }
  return false;
};

export const getEdges = (
  profileData: ProfileData,
  dataType: EditData['dataType']
): EdgeList | null => {
  if (dataType === 'addresses') {
    return profileData.addresses && profileData.addresses.edges
      ? (profileData.addresses.edges as (AddressEdge | null)[])
      : null;
  }
  if (dataType === 'emails') {
    return profileData.emails && profileData.emails.edges
      ? (profileData.emails.edges as (EmailEdge | null)[])
      : null;
  }
  if (dataType === 'phones') {
    return profileData.phones && profileData.phones.edges
      ? (profileData.phones.edges as (PhoneEdge | null)[])
      : null;
  }
  return null;
};

export const getNewList = (
  dataType: EditData['dataType'],
  edges: EdgeList | null,
  primary: InsertableEdge | null
): MutableAddresses | MutableEmails | MutablePhones => {
  let list;
  if (dataType === 'addresses') {
    list = createAddresses() as MutableAddresses;
    list.edges = edges ? ([...edges] as AddressEdge[]) : [];
    if (primary) {
      list.edges.unshift(primary as AddressEdge);
    }
  } else if (dataType === 'emails') {
    list = createEmails() as MutableEmails;
    list.edges = edges ? ([...edges] as EmailEdge[]) : [];
    if (primary) {
      list.edges.unshift(primary as EmailEdge);
    }
  } else {
    list = createPhones() as MutablePhones;
    list.edges = edges ? ([...edges] as PhoneEdge[]) : [];
    if (primary) {
      list.edges.unshift(primary as PhoneEdge);
    }
  }
  return list;
};

export const primaryToNode = (
  profileData: ProfileData,
  dataType: EditData['dataType']
): InsertableEdge | null => {
  const primary = getPrimaryNode(profileData, dataType);
  if (!primary) {
    return null;
  }
  if (dataType === 'addresses') {
    return createNewAddressEdgeWithNodeData(primary as AddressNode);
  }
  if (dataType === 'emails') {
    return createNewEmailEdgeWithNodeData(primary as EmailNode);
  }
  if (dataType === 'phones') {
    return createNewPhoneEdgeWithNodeData(primary as PhoneNode);
  }
  return null;
};

export const collectAllNodes = (
  profileData: ProfileData,
  dataType: EditData['dataType']
): MutableAddresses | MutableEmails | MutablePhones => {
  const nodeList = getEdges(profileData, dataType);
  const primary = primaryToNode(profileData, dataType);
  return getNewList(dataType, nodeList as EdgeList, primary);
};

export const findNodeById = (
  profileData: ProfileData,
  dataType: EditData['dataType'],
  id: string
): InsertableNode | null => {
  const primary = getPrimaryNode(profileData, dataType);
  if (primary && primary.id === id) {
    return primary;
  }
  const edgeList = getEdges(profileData, dataType) || [];
  const edge = edgeList.find(
    listEdge => listEdge && listEdge.node && listEdge.node.id === id
  );
  return (edge && edge.node) || null;
};

export function edgesObjectToNodeList(
  list: Addresses | Emails | Phones
): InsertableNode[] {
  return (list.edges as unknown[])
    .filter(edge => !!edge && !!(edge as InsertableEdge).node)
    .map(edge => (edge as InsertableEdge).node as InsertableNode);
}

export function setAsPrimary(
  myProfileData: ProfileData,
  editData: EditData | null,
  dataType: EditData['dataType']
): void {
  if (dataType === 'addresses') {
    setPrimaryAddress(
      myProfileData,
      editData ? (editData.profileData as AddressNode) : null
    );
  } else if (dataType === 'emails') {
    setPrimaryEmail(
      myProfileData,
      editData ? (editData.profileData as EmailNode) : null
    );
  } else if (dataType === 'phones') {
    setPrimaryPhone(
      myProfileData,
      editData ? (editData.profileData as PhoneNode) : null
    );
  } else {
    throw new Error(`${dataType} cannot be primary`);
  }
}

export function getAddFunc(
  dataType: EditData['dataType']
): (
  profile: ProfileData,
  newValues: Partial<InsertableNode>[],
  index?: number
) => InsertableEdge[] {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return dataType === 'addresses'
    ? addAddresses
    : dataType === 'phones'
    ? addPhones
    : addEmails;
}

export function getCreatorFunc(
  dataType: EditData['dataType']
): () => Partial<InsertableNode> {
  return dataType === 'addresses'
    ? createAddressData
    : dataType === 'phones'
    ? createPhoneData
    : createEmailData;
}

/* ADDRESS FUNCS */

export const createAddresses = (): Addresses =>
  createEdgeArray<Addresses>(getAddresses().__typename);

export const createAddressEdge = (): Mutable<AddressEdge> => {
  const __typename = (getAddresses().edges[0] as AddressEdge).__typename;
  const cloneNode: AddressEdge = {
    __typename,
    node: createNewProfileData('addresses') as AddressNode,
  };
  return cloneNode;
};

export const createNewAddressEdgeWithNodeData = (
  newValues: Partial<AddressNode>
): Mutable<AddressEdge> =>
  createNewEdgeWithData(createAddressEdge(), newValues) as Mutable<AddressEdge>;

export const findAndUpdateAddressEdgesNode = (
  addresses: Addresses,
  id: string,
  newValues: Partial<AddressNode>
): AddressNode => {
  const edges = addresses.edges as Mutable<AddressEdge>[];
  return findAndUpdateEdgesNode(edges, id, newValues) as AddressNode;
};

export const addAddresses = (
  profile: ProfileData,
  newValues: Partial<AddressNode>[],
  index?: number
): AddressEdge[] =>
  addNodeToEdges(
    getAddresses(profile).edges as Mutable<AddressEdge>[],
    newValues.map(values => createNewAddressEdgeWithNodeData(values)),
    index
  ) as AddressEdge[];

export const removeAddress = (profile: ProfileData, id: string): boolean =>
  removeNodeFromEdges(
    getAddresses(profile).edges as Mutable<AddressEdge>[],
    id
  ) || removePrimaryIfIdMatch(profile, id, 'addresses');

export const setPrimaryAddress = (
  profile: ProfileData,
  newPrimary: Mutable<AddressNode> | null
): void => {
  if (newPrimary) {
    newPrimary.primary = true;
    removeAddress(profile, newPrimary.id);
  }
  if (profile.primaryAddress) {
    const node = profile.primaryAddress as Mutable<AddressNode>;
    node.primary = false;
    removeAddress(profile, node.id);
    addAddresses(profile, [node]);
  }
  setPrimaryNode(profile, 'addresses', newPrimary);
};

export const createAddressData = (): Partial<AddressNode> => {
  const id = createId();
  const data: Partial<AddressNode> = {
    id,
    address: `address-${id}`,
    postalCode: `${10000 + idCounter}`,
    city: `city-${id}`,
    countryCode: 'FI',
  };
  return data;
};

/* EMAIL FUNCS */

export const createEmails = (): Emails =>
  createEdgeArray<Emails>(getEmails().__typename);

export const createEmailsEdge = (): Mutable<EmailEdge> => {
  const __typename = (getEmails().edges[0] as EmailEdge).__typename;
  const cloneNode: EmailEdge = {
    __typename,
    node: createNewProfileData('emails') as EmailNode,
  };
  return cloneNode;
};

export const createNewEmailEdgeWithNodeData = (
  newValues: Partial<EmailNode>
): Mutable<EmailEdge> =>
  createNewEdgeWithData(createEmailsEdge(), newValues) as Mutable<EmailEdge>;

export const findAndUpdateEmailEdgesNode = (
  emails: Emails,
  id: string,
  newValues: Partial<EmailNode>
): EmailNode => {
  const edges = emails.edges as Mutable<EmailEdge>[];
  return findAndUpdateEdgesNode(edges, id, newValues) as EmailNode;
};

export const addEmails = (
  profile: ProfileData,
  newValues: Partial<EmailNode>[],
  index?: number
): EmailEdge[] =>
  addNodeToEdges(
    getEmails(profile).edges as Mutable<EmailEdge>[],
    newValues.map(values => createNewEmailEdgeWithNodeData(values)),
    index
  ) as EmailEdge[];

export const removeEmail = (profile: ProfileData, id: string): boolean =>
  removeNodeFromEdges(getEmails(profile).edges as Mutable<EmailEdge>[], id) ||
  removePrimaryIfIdMatch(profile, id, 'emails');

export const setPrimaryEmail = (
  profile: ProfileData,
  newPrimary: Mutable<EmailNode> | null
): void => {
  if (newPrimary) {
    newPrimary.primary = true;
    removeEmail(profile, newPrimary.id);
  }
  if (profile.primaryEmail) {
    const node = profile.primaryEmail as Mutable<EmailNode>;
    node.primary = false;
    removeEmail(profile, node.id);
    addEmails(profile, [node]);
  }
  setPrimaryNode(profile, 'emails', newPrimary);
};

export const createEmailData = (): Partial<EmailNode> => {
  const id = createId();
  const data: Partial<EmailNode> = {
    id,
    email: `${id}@email.com`,
  };
  return data;
};

/* PHONE FUNCS */

export const createPhones = (): Phones =>
  createEdgeArray<Phones>(getPhones().__typename);

export const createPhonesEdge = (): Mutable<PhoneEdge> => {
  const __typename = (getPhones().edges[0] as PhoneEdge).__typename;
  const cloneNode: PhoneEdge = {
    __typename,
    node: createNewProfileData('phones') as PhoneNode,
  };
  return cloneNode;
};

export const createNewPhoneEdgeWithNodeData = (
  newValues: Partial<PhoneNode>
): Mutable<PhoneEdge> =>
  createNewEdgeWithData(createPhonesEdge(), newValues) as Mutable<PhoneEdge>;

export const findAndUpdatePhoneEdgesNode = (
  phones: Phones,
  id: string,
  newValues: Partial<PhoneNode>
): PhoneNode => {
  const edges = phones.edges as Mutable<PhoneEdge>[];
  return findAndUpdateEdgesNode(edges, id, newValues) as PhoneNode;
};

export const addPhones = (
  profile: ProfileData,
  newValues: Partial<PhoneNode>[],
  index?: number
): PhoneEdge[] =>
  addNodeToEdges(
    getPhones(profile).edges as Mutable<PhoneEdge>[],
    newValues.map(values => createNewPhoneEdgeWithNodeData(values)),
    index
  ) as PhoneEdge[];

export const removePhone = (profile: ProfileData, id: string): boolean =>
  removeNodeFromEdges(getPhones(profile).edges as Mutable<PhoneEdge>[], id) ||
  removePrimaryIfIdMatch(profile, id, 'phones');

export const setPrimaryPhone = (
  profile: ProfileData,
  newPrimary: Mutable<PhoneNode> | null
): void => {
  if (newPrimary) {
    newPrimary.primary = true;
    removePhone(profile, newPrimary.id);
  }
  if (profile.primaryPhone) {
    const node = profile.primaryPhone as Mutable<PhoneNode>;
    node.primary = false;
    removePhone(profile, node.id);
    addPhones(profile, [node]);
  }
  setPrimaryNode(profile, 'phones', newPrimary);
};

export const createPhoneData = (): Partial<PhoneNode> => {
  const id = createId();
  const data: Partial<PhoneNode> = {
    id,
    phone: `phone-${id}`,
  };
  return data;
};
