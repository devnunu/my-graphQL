# myGraphQL

## 목적

GraphQL 를 통해 간단한 영화 API 를 만들어본다

## GraphQL 를 사용하는 이유

### over-fetching

만약 유저의 정보를 받기위해 REST 로 요청을 보내게 된다면 '/users/ GET' 과 같은 식으로 보낼 것이다.
그러나 초기 요청에서 응답하는 데이터 셋(set)중에 유저의 이름만 사용한다고 하면, 이는 상당히 비효율적인 모습이다.
따라서 서버에 요청을 할 떄 자신이 사용하지도 않을 과다한 데이터가 날아오는것을 overfetching 이라고한다.
이는 앞서 언급했듯이 상당히 비효율적이고 개발자가 무엇을 받았는지 모르게 된다.

이를 해결하기 위해서는 프론트에서 데이터 베이스에 오직 사용되어질 '유저명'만 요청하면 해결된다.
이것을 가능하게 하는것이 graphQL 의 핵심 기능이다.

### under-fetching

실제 서비스를 사용한다면 상당히 많은 요청이 이루어지게된다.
예를 들어 인스타그램이라면 '/feed/, /notification/, /user/1' 등의 요청이 있을것이다.
즉 REST 에서 하나의 기능을 완성하기 위해서 여러 요청을 보내야한다는 것이다.
이 또한 graphQL 으로 해결이 가능하다.

## GraphQL 의 특징

REST 처럼 요청에 대한 개별적인 url 이 존재하지 않는다. 하나의 종점만 존재하며 에를 들면 /graphql/이 될 수 있을 것이다.
GraphQL 에서 QL 은 Query Language 를 뜻하는 것이므로 아래와 같은 형식의 Query 를 요청함으로서 필요한 데이터를 얻을수 있다.

```
query {
    feed {
        commnets
        likeNumber
    }
    notification {
        isRead
    }
    user {
        username
        profilePic
    }
}
```

이와 같은 Query 에 응답은 다음과 같다

```javascript
{
    feed:[
        {
            commnet:1,
            likeNumber:20
        }
    ],
    notification:[
        {
            isRead:false
        }
    ],
    user:[
        {
            username:"sam",
            profilePic:"http:..."
        }
    ]
}
```

## 환경 설정

graphQL 을 쉽게 사용하기 위한 graphql yoga 와(https://github.com/prismagraphql/graphql-yoga)
node 에서 확장된 문법을 사용하기 위해 babel 등의 모듈을 설치한다.

```bash
yarn add graphql-yoga   # graphql
yarn global add nodemon # 노드 실행
yarn add babel-cli babel-preset-env babel-preset-stage-3 --dev
```

- .babelrc 를 생성하고 아래와 같이 설정한다.

```json
{
  "presets": ["env", "stage-3"]
}
```

- 그리고 package.json 에 아래와 같은 스크립트를 추가한다.

```json
  "scripts": {
    "start": "nodemon --exec babel-node index.js"
  }
```

다음으로 index.js 파일을 만들고 아래의 코드를 넣자.
이때 스키마가 정의되지 않았으므로 Error: No schema defined 에러가 출력될 것이다.
여기까지 왔으면 정상적으로 환경세팅이 완료되었다.

```js
import { GraphQLServer } from 'graphql-yoga';

const server = new GraphQLServer({});

server.start(() => console.log('graphQL server is running'));
```

## 첫번쨰 Query 와 Resolver 를 만들어 보자

위에서 언급한 스키마는 프로그래밍이나 언어가 아니라
**내가 무엇을 보낼것인지, 또는 무엇을 받을것인지에 대한 '명세'**이다.
이러한 명세를 server 가 알고 있어야지 정확한 데이터를 주고 받는 것이 가능해진다
따라서 우리의 프로젝트 폴더에 schema.graphql 을 만들어준다.

첫번째로 Query 라는 타입의 query 를 선언했다. 내부에 name 이라는 string 값 변수를 명세한다.

```graphql
type Query {
  name: String!
}
```

다음으로 resolver.js 파일을 생성한다.
이는 명세에 대한 구체적인 행동(함수)를 정의한다. 코드는 다음과 같다.

```js
const resolvers = {
  Query: {
    name: () => 'sam'
  }
};

export default resolvers;
```

다시 index.js 로 돌아가서 우리가 만든 resolver 와 query 를 추가해준다.

```js
import { GraphQLServer } from 'graphql-yoga';
import resolvers from './graphql/resolvers';

const server = new GraphQLServer({
  typeDefs: 'graphql/schema.graphql',
  resolvers
});

server.start(() => console.log('graphQL server is running on localhost:4000'));
```

기본적으로 서버 실행 후 localhost:4000 번으로 접속하면 graphQL 이 제공하는 UI 가 나온다. 여기서 query 를 작성해주면 우리가 작성한 resolver 의 함수에 따라서 결과값이 리턴되는 것을 확인할 수 있다.

## 사용자 정의 자료형 대한 Query

그렇다면 객체와 같은 사용자 정의 자료형은 어떻게 정의해줄까
resolver 를 다음과 같이 변경한다. 따라서 person 을 호출하면 person 객체가 리턴된다.

```js
const person = {
  name: 'sam',
  age: 18,
  gender: 'male'
};

const resolvers = {
  Query: {
    person: () => person
  }
};

export default resolvers;
```

graphql 은 다음과 같이 타입 지정을 해주어야한다.
객체라고 하더라도 내부 요소들은 기본형을 가지고 있기 때문에 type 설정만 제대로 해주면 된다.

```graphql
type person {
  name: String!
  age: Int!
  gender: String!
}

type Query {
  person: person!
}
```
