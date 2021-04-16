import _ from 'lodash';

import {
  ProfileRoot,
  AddressType,
  EmailType,
  Language,
  PhoneType,
  VerifiedPersonalInformation,
  ProfileData,
  EdgeList,
  Mutable,
  InsertableEdge,
  AddressNode,
  EmailNode,
  PhoneNode,
  PrimaryPhone,
  PrimaryEmail,
  PrimaryAddress,
} from '../../graphql/typings';
import { formConstants } from '../../profile/constants/formConstants';
import {
  AdditionalInformationSource,
  additionalInformationType,
  AdditionalInformationValue,
  BasicDataSource,
  basicDataType,
  BasicDataValue,
  EditDataProfileSource,
  EditDataType,
  FormValues,
  MultiItemProfileNode,
  pickSources,
} from '../../profile/helpers/editData';

export type ManipulationFunctions = {
  getProfile: () => ProfileData;
  getFormValues: () => FormValues;
  add: (
    dataType: EditDataType,
    data: Partial<MultiItemProfileNode>,
    index?: number
  ) => ManipulationFunctions;
  remove: (
    dataType: EditDataType,
    { id }: { id: string }
  ) => ManipulationFunctions;
  setPrimary: (
    dataType: EditDataType,
    node: MultiItemProfileNode | null
  ) => ManipulationFunctions;
  edit: (
    dataType: EditDataType,
    node: Partial<EditDataProfileSource>
  ) => ManipulationFunctions;
  setBasicData: (basicData: BasicDataValue) => ManipulationFunctions;
  setAdditionalInformation: (
    basicData: AdditionalInformationValue
  ) => ManipulationFunctions;
};

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
            id: '123',
            primary: true,
            address: 'Testikatu 55',
            city: 'Helsinki',
            countryCode: 'FI',
            postalCode: '00100',
            addressType: AddressType.OTHER,
            __typename: 'AddressNode',
          },
          __typename: 'AddressNodeEdge',
        },
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
            id: '123',
            email: 'ensimmainen@testi.fi',
            primary: true,
            emailType: EmailType.OTHER,
            __typename: 'EmailNode',
          },
          __typename: 'EmailNodeEdge',
        },
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
            id: '123',
            phone: '0501234567',
            phoneType: PhoneType.OTHER,
            primary: true,
            __typename: 'PhoneNode',
          },
          __typename: 'PhoneNodeEdge',
        },
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
    __typename: 'ProfileNode',
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
    countryCode: 'AF',
  },
  ...overrides,
});

function createNewProfileNode(dataType: EditDataType): MultiItemProfileNode {
  return {
    ...formConstants.EMPTY_VALUES[dataType],
  };
}

function findNode(
  nodes: MultiItemProfileNode[],
  id: string,
  returnIndex = false
): number | MultiItemProfileNode | undefined {
  const func = returnIndex ? 'findIndex' : 'find';
  return nodes[func](node => node.id === id);
}

function getEdges(
  profileData: ProfileData,
  dataType: EditDataType
): EdgeList | null {
  const targetPath = `${dataType}.edges`;
  return _.get(profileData, targetPath, null);
}

function getEdgeTypeName(
  dataType: EditDataType
): 'EmailNodeEdge' | 'AddressNodeEdge' | 'PhoneNodeEdge' {
  if (dataType === 'emails') {
    return 'EmailNodeEdge';
  }
  if (dataType === 'phones') {
    return 'PhoneNodeEdge';
  }
  return 'AddressNodeEdge';
}

function getPrimaryPropName(
  dataType: EditDataType
): 'primaryAddress' | 'primaryPhone' | 'primaryEmail' {
  if (dataType === 'emails') {
    return 'primaryEmail';
  }
  if (dataType === 'phones') {
    return 'primaryPhone';
  }
  return 'primaryAddress';
}

function createEdge(
  dataType: EditDataType,
  nodeData: Partial<MultiItemProfileNode>
): Mutable<InsertableEdge> {
  const typename = getEdgeTypeName(dataType);
  const node = {
    ...createNewProfileNode(dataType),
    ...nodeData,
  };
  return {
    __typename: typename,
    node,
  } as InsertableEdge;
}

function setPrimaryNode(
  profile: Mutable<ProfileData>,
  dataType: EditDataType,
  newPrimary: Mutable<MultiItemProfileNode> | null
): void {
  if (newPrimary) {
    newPrimary.primary = true;
  }
  const propName = getPrimaryPropName(dataType);
  Object.assign(profile, { [propName]: newPrimary });
}

export function cloneAndManipulateProfile(
  profileData: ProfileData
): ManipulationFunctions {
  const currentProfile = _.cloneDeep(profileData) as Mutable<ProfileData>;
  // added nodes must have empty id in formValues but id in the created GraphQL
  // which requires same extra check ups and deletion:
  const addedNodes: Set<string> = new Set();
  return {
    getProfile() {
      return currentProfile;
    },
    add(dataType, data, index = -1) {
      const edge = createEdge(dataType, data);
      const target = getEdges(currentProfile, dataType);
      if (!target) {
        throw Error('Cannot add edge');
      }
      if (index === -1) {
        target.push(edge);
      } else {
        target.splice(index, 0, edge);
      }
      addedNodes.add(`${dataType}_${data.id}`);
      return this;
    },
    remove(dataType, prop) {
      const nodeList = pickSources(currentProfile, dataType);
      const index = findNode(
        nodeList as MultiItemProfileNode[],
        prop.id,
        true
      ) as number;
      const target = getEdges(currentProfile, dataType);
      if (index < 0 || !target) {
        throw Error('Cannot find node to remove or edges');
      }
      target.splice(index, 1);
      return this;
    },
    setPrimary(dataType, node) {
      setPrimaryNode(currentProfile, dataType, node);
      return this;
    },
    edit(dataType, node) {
      const target = getEdges(currentProfile, dataType);
      if (!target) {
        throw Error('Cannot edit edges');
      }
      const targetEdge = target.find(edge => edge?.node?.id === node.id);
      if (!targetEdge) {
        throw Error('Cannot edit edge');
      }
      Object.assign(targetEdge.node, node);
      return this;
    },
    setBasicData(basicData) {
      Object.assign(currentProfile, basicData);
      return this;
    },
    setAdditionalInformation(additionalInformation) {
      Object.assign(currentProfile, additionalInformation);
      return this;
    },
    getFormValues() {
      const basicData = pickSources(
        currentProfile,
        basicDataType
      )[0] as BasicDataSource;
      const additionalInformation = pickSources(
        currentProfile,
        additionalInformationType
      )[0] as AdditionalInformationSource;
      const addresses = _.cloneDeep(
        pickSources(currentProfile, 'addresses')
      ) as AddressNode[];
      const phones = pickSources(currentProfile, 'phones') as PhoneNode[];
      const emails = pickSources(currentProfile, 'emails') as EmailNode[];

      // clear ids of added nodes
      const clearAddedIds = (
        dataType: EditDataType,
        nodeList: MultiItemProfileNode[]
      ) => {
        nodeList.forEach((node: Mutable<MultiItemProfileNode>) => {
          if (addedNodes.has(`${dataType}_${node.id}`)) {
            node.id = '';
          }
        });
      };
      clearAddedIds('addresses', addresses);
      clearAddedIds('phones', phones);
      clearAddedIds('emails', emails);

      return {
        ...basicData,
        ...additionalInformation,
        addresses,
        phones,
        emails,
        primaryAddress:
          addresses[0] && addresses[0].primary
            ? (addresses[0] as PrimaryAddress)
            : undefined,
        primaryEmail:
          emails[0] && emails[0].primary
            ? (emails[0] as PrimaryEmail)
            : undefined,
        primaryPhone:
          phones[0] && phones[0].primary
            ? (phones[0] as PrimaryPhone)
            : undefined,
      } as FormValues;
    },
  };
}
