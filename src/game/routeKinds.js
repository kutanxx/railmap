// 노선 종류: 지하철(기본) 또는 광역급행(GTX). 노선마다 route.kind에 적는다 (없으면 지하철, 예전 저장 파일도 지하철로 읽는다).
// 종류마다 열차 성능·값·운영비·요금이 다르다. 열차 달리기(running.js·sim.js), 길찾기(tripFinder.js),
// 승객·수입(demand.js), 돈(routes.js·economy.js), 열차 그리기(ui/animation.js)가 모두 여기서 읽는다.
import {
  TRAIN_SPEED_KMH,
  TRAIN_ACCELERATION,
  TRAIN_CAPACITY,
  TRAIN_COST,
  OPEX_PER_TRAIN,
  TRAIN_LENGTH_M,
  EXPRESS_SPEED_KMH,
  EXPRESS_ACCELERATION,
  EXPRESS_CAPACITY,
  EXPRESS_TRAIN_COST,
  EXPRESS_OPEX_PER_TRAIN,
  EXPRESS_FARE_RATIO,
  EXPRESS_TRAIN_LENGTH_M,
} from '../config.js';

// 고를 수 있는 종류 (노선 패널의 버튼 순서)
export const ROUTE_KINDS = ['subway', 'express'];

// 종류마다 열차: label 이름, speedKmh 최고 속도, acceleration 가속·감속(m/s²), capacity 정원,
// trainCost 열차 값(억), opexPerTrain 매달 운영비(억), fareRatio 요금 배수, lengthM 열차 길이
const SPECS = {
  subway: {
    label: '지하철',
    speedKmh: TRAIN_SPEED_KMH,
    acceleration: TRAIN_ACCELERATION,
    capacity: TRAIN_CAPACITY,
    trainCost: TRAIN_COST,
    opexPerTrain: OPEX_PER_TRAIN,
    fareRatio: 1,
    lengthM: TRAIN_LENGTH_M,
  },
  express: {
    label: '광역급행',
    speedKmh: EXPRESS_SPEED_KMH,
    acceleration: EXPRESS_ACCELERATION,
    capacity: EXPRESS_CAPACITY,
    trainCost: EXPRESS_TRAIN_COST,
    opexPerTrain: EXPRESS_OPEX_PER_TRAIN,
    fareRatio: EXPRESS_FARE_RATIO,
    lengthM: EXPRESS_TRAIN_LENGTH_M,
  },
};

// 노선(또는 종류 이름)의 종류: 'subway' | 'express'
export const kindOf = (routeOrKind) => {
  const kind = typeof routeOrKind === 'string' ? routeOrKind : routeOrKind?.kind;
  return kind === 'express' ? 'express' : 'subway';
};

// 노선(또는 종류 이름)의 열차 성능
export const trainSpec = (routeOrKind) => SPECS[kindOf(routeOrKind)];

// 광역급행 노선인지
export const isExpress = (route) => kindOf(route) === 'express';
