import index from '../pages/index';


const routers = [
    {
        path: '/',
        name: 'index',
        component: index,
        meta: {
            keepAlive: false // 不需要缓存
        }
    }
];
export default routers;
