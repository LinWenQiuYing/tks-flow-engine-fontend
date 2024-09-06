import { ref } from "vue";

export const typeOptions = ref([
  /* 
    1:MySql 2:Oracle 3:ArgoDB 4:KunDB 5:SqlServer
    6:KingBase 7:PostGreSql 8:Redis 9:RabbitMQ 10:KafkaConsumer
    11:KafkaProducer 12:Excel 13:Text 14:StellarDB 15:Neo4J
    16:Nebula 17:Hive 18:Inceptor
  */
  {
    label: "MySql",
    value: 1,
    icon: require(`@/assets/images/img/MYSQL.svg`),
  },
  {
    label: "Oracle",
    value: 2,
    icon: require(`@/assets/images/img/ORACLE.svg`),
  },
  {
    label: "ArgoDB",
    value: 3,
    icon: require(`@/assets/images/img/ARGODB.svg`),
  },
  {
    label: "KunDB",
    value: 4,
    icon: require(`@/assets/images/img/KUNDB.svg`),
  },
  {
    label: "SqlServer",
    value: 5,
    icon: require(`@/assets/images/img/SQLSERVER.svg`),
  },
  {
    label: "KingBase",
    value: 6,
    icon: require(`@/assets/images/img/KINGBASE.svg`),
  },
  {
    label: "PostGreSql",
    value: 7,
    icon: require(`@/assets/images/img/POSTGRESQL.svg`),
  },
  {
    label: "Redis",
    value: 8,
    icon: require(`@/assets/images/img/REDISKV.svg`),
  },
  {
    label: "RabbitMQ",
    value: 9,
    icon: require(`@/assets/images/img/RABBITMQ.svg`),
  },
  {
    label: "KafkaConsumer",
    value: 10,
    icon: require(`@/assets/images/img/KAFKA.svg`),
  },
  {
    label: "KafkaProducer",
    value: 11,
    icon: require(`@/assets/images/img/KAFKA.svg`),
  },
  {
    label: "Excel",
    value: 12,
    icon: require(`@/assets/images/img/EXCLE.svg`),
  },
  {
    label: "Text",
    value: 13,
    icon: require(`@/assets/images/img/TEXT.svg`),
  },
  {
    label: "StellarDB",
    value: 14,
    icon: require(`@/assets/images/img/STELLARDB.svg`),
  },
  {
    label: "Neo4J",
    value: 15,
    icon: require(`@/assets/images/img/NEO4J.svg`),
  },
  {
    label: "Nebula",
    value: 16,
    icon: require(`@/assets/images/img/NEBULA.svg`),
  },
  {
    label: "Hive",
    value: 17,
    icon: require(`@/assets/images/img/HIVE.svg`),
  },
  {
    label: "Inceptor",
    value: 18,
    icon: require(`@/assets/images/img/INCEPTOR.svg`),
  },
])