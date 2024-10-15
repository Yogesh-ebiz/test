import {epochToPath} from './helper';


export function buildPartyUrl(party) {
  return `/${party.partyType.toLowerCase()}/${party.id}/images/${party.avatar}`;
};

export function buildUserAvatar(party) {
  if(!party.avatar){
    return '';
  }
  const id = party.userId?party.userId:party.id
  return `${process.env.ACCESSED_CDN}/user/${id}/avatar/${party.avatar}`;
};


export function buildPartyAvatarUrl(party) {
  if(!party || !party.partyType){
    return;
  }

  const partyType = party.partyType=='PERSON'?'user':party.partyType.toLowerCase();
  return `${process.env.ACCESSED_CDN}/${partyType}/${party.id}/images/${party.avatar}`;
};



export function buildPartyCoverUrl(party) {
  let coverImageUrl = (party.cover)? party.cover:"cover1.png";
  const partyType = party.partyType=='PERSON'?'user':party.partyType.toLowerCase();
  let path = (party && party.cover)? (partyType + "/" + party.id + "/covers") : "covers";
  return `${process.env.ACCESSED_CDN}/${path}/${coverImageUrl}`;
};


export function buildGroupImageUrl(group) {
    return `$${process.env.ACCESSED_CDN}/${group.partyType.toLowerCase()}/${group.id}/images/${group.avatar}`;
};


export function buildUserImageUrl(user) {
    return `$${process.env.ACCESSED_CDN}/${user.partyType.toLowerCase()}/${user.id}/images/${user.imageUrl}`;
};

export function feedImageUrl(id, image, timestamp, size) {
  let path = null;
  if(timestamp && image){

    size = size?size: 'm';
    image = `${process.env.ACCESSED_CDN}/feeds/${epochToPath(timestamp)}/${id}/${size}/${image}`;

  }
  return image;
};


export function feedImageUrls(id, images, timestamp, size) {
  let path = null;
  let res = [];
  size = size?size: 'm';
  if(timestamp && images){

    images.forEach(el => {
      res.push(`${process.env.ACCESSED_CDN}/feeds/${epochToPath(timestamp)}/${id}/${size}/${el}`);
    })
  }

  return res;
};

export function categoryImageUrl(category) {
  return `${process.env.ACCESSED_CDN}/category/${category.id}/${category.icon}`;
};
